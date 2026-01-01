using System.Net.Http.Headers;
using System.Text;
using FlightSearchEngine.Models;
using Newtonsoft.Json;
using System.Globalization;

namespace FlightSearchEngine.Services
{
    public class AmadeusFlightService : IFlightSearchService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AmadeusFlightService> _logger;

        private readonly string _apiKey;
        private readonly string _apiSecret;
        private readonly string _baseUrl;

        private string _accessToken;
        private DateTime _tokenExpiration;

        public AmadeusFlightService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<AmadeusFlightService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;

            _apiKey = _configuration["Amadeus:ApiKey"];
            _apiSecret = _configuration["Amadeus:ApiSecret"];
            _baseUrl = _configuration["Amadeus:BaseUrl"];

            _tokenExpiration = DateTime.MinValue;
        }

        private async Task EnsureAuthenticatedAsync()
        {
            if (!string.IsNullOrEmpty(_accessToken) && DateTime.UtcNow < _tokenExpiration)
            {
                return;
            }

            _logger.LogInformation("Authentification auprès de Amadeus...");

            var credentials = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials"),
                new KeyValuePair<string, string>("client_id", _apiKey),
                new KeyValuePair<string, string>("client_secret", _apiSecret)
            });

            var response = await _httpClient.PostAsync(
                _baseUrl + "/v1/security/oauth2/token",
                credentials);

            var jsonResponse = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Échec authentification Amadeus: {Response}", jsonResponse);
                throw new Exception("Échec de l'authentification Amadeus: " + jsonResponse);
            }

            var tokenData = JsonConvert.DeserializeObject<AmadeusTokenResponse>(jsonResponse);

            _accessToken = tokenData.AccessToken;
            _tokenExpiration = DateTime.UtcNow.AddSeconds(tokenData.ExpiresIn - 60);

            _logger.LogInformation("Authentification Amadeus réussie");
        }

        public async Task<List<Airport>> SearchAirportsAsync(string keyword)
        {
            var airports = new List<Airport>();

            if (string.IsNullOrWhiteSpace(keyword) || keyword.Length < 2)
            {
                return airports;
            }

            try
            {
                await EnsureAuthenticatedAsync();

                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _accessToken);

                var url = _baseUrl + "/v1/reference-data/locations?" +
                          "subType=AIRPORT,CITY&" +
                          "keyword=" + Uri.EscapeDataString(keyword) + "&" +
                          "page[limit]=10";

                _logger.LogInformation("Recherche aéroports: {Keyword}", keyword);

                var response = await _httpClient.GetAsync(url);
                var jsonResponse = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Erreur recherche aéroports: {Response}", jsonResponse);
                    return airports;
                }

                var amadeusResponse = JsonConvert.DeserializeObject<AmadeusAirportSearchResponse>(jsonResponse);

                if (amadeusResponse == null || amadeusResponse.Data == null)
                {
                    return airports;
                }

                foreach (var item in amadeusResponse.Data)
                {
                    var airport = new Airport
                    {
                        IataCode = item.IataCode,
                        Name = item.Name,
                        CityName = item.Address != null ? item.Address.CityName : "",
                        CountryName = item.Address != null ? item.Address.CountryName : ""
                    };
                    airports.Add(airport);
                }

                _logger.LogInformation("Trouvé {Count} aéroports", airports.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche d'aéroports");
            }

            return airports;
        }

        public async Task<FlightSearchResult> SearchFlightsAsync(FlightSearchRequest request)
        {
            var result = new FlightSearchResult
            {
                OriginalRequest = request,
                SearchTimestamp = DateTime.UtcNow
            };

            try
            {
                await EnsureAuthenticatedAsync();

                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _accessToken);

                var url = BuildFlightSearchUrl(request);

                _logger.LogInformation("Recherche vols: {Origin} -> {Destination}",
                    request.Origin, request.Destination);

                var response = await _httpClient.GetAsync(url);
                var jsonResponse = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Erreur API Amadeus: {Response}", jsonResponse);

                    var errorResponse = JsonConvert.DeserializeObject<AmadeusErrorResponse>(jsonResponse);
                    string errorMessage = jsonResponse;

                    if (errorResponse != null && errorResponse.Errors != null && errorResponse.Errors.Count > 0)
                    {
                        errorMessage = errorResponse.Errors[0].Detail;
                    }

                    result.Success = false;
                    result.ErrorMessage = errorMessage;
                    return result;
                }

                var amadeusResponse = JsonConvert.DeserializeObject<AmadeusFlightOffersResponse>(jsonResponse);

                result.Flights = ConvertToFlights(amadeusResponse);
                result.TotalResults = result.Flights.Count;
                result.Success = true;

                _logger.LogInformation("Trouvé {Count} vols", result.TotalResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche de vols");
                result.Success = false;
                result.ErrorMessage = ex.Message;
            }

            return result;
        }

        private string BuildFlightSearchUrl(FlightSearchRequest request)
        {
            var url = new StringBuilder();
            url.Append(_baseUrl);
            url.Append("/v2/shopping/flight-offers?");
            url.Append("originLocationCode=");
            url.Append(request.Origin);
            url.Append("&destinationLocationCode=");
            url.Append(request.Destination);
            url.Append("&departureDate=");
            url.Append(request.DepartureDate.ToString("yyyy-MM-dd"));
            url.Append("&adults=");
            url.Append(request.Adults);

            if (request.Children > 0)
            {
                url.Append("&children=");
                url.Append(request.Children);
            }

            if (request.Infants > 0)
            {
                url.Append("&infants=");
                url.Append(request.Infants);
            }

            if (request.ReturnDate.HasValue)
            {
                url.Append("&returnDate=");
                url.Append(request.ReturnDate.Value.ToString("yyyy-MM-dd"));
            }

            if (!string.IsNullOrEmpty(request.TravelClass))
            {
                url.Append("&travelClass=");
                url.Append(request.TravelClass);
            }

            url.Append("&currencyCode=EUR");
            url.Append("&max=50");

            return url.ToString();
        }

        private List<Flight> ConvertToFlights(AmadeusFlightOffersResponse amadeusResponse)
        {
            var flights = new List<Flight>();

            if (amadeusResponse == null || amadeusResponse.Data == null)
            {
                return flights;
            }

            foreach (var offer in amadeusResponse.Data)
            {
                var flight = new Flight
                {
                    Id = offer.Id,
                    Currency = offer.Price.Currency
                };

                string priceString = offer.Price.GrandTotal;
                if (string.IsNullOrEmpty(priceString))
                {
                    priceString = offer.Price.Total;
                }
                flight.TotalPrice = decimal.Parse(priceString, CultureInfo.InvariantCulture);

                if (offer.TravelerPricings != null && offer.TravelerPricings.Count > 0)
                {
                    foreach (var traveler in offer.TravelerPricings)
                    {
                        if (traveler.TravelerType == "ADULT" && traveler.Price != null)
                        {
                            flight.PricePerAdult = decimal.Parse(traveler.Price.Total, CultureInfo.InvariantCulture);
                            break;
                        }
                    }
                }

                if (offer.Itineraries != null && offer.Itineraries.Count > 0)
                {
                    var outbound = offer.Itineraries[0];
                    flight.TotalDuration = outbound.Duration;
                    flight.NumberOfStops = outbound.Segments.Count - 1;

                    foreach (var segment in outbound.Segments)
                    {
                        var flightSegment = ConvertSegment(segment, amadeusResponse.Dictionaries);
                        flight.OutboundSegments.Add(flightSegment);
                    }
                }

                if (offer.Itineraries != null && offer.Itineraries.Count > 1)
                {
                    var inbound = offer.Itineraries[1];

                    foreach (var segment in inbound.Segments)
                    {
                        var flightSegment = ConvertSegment(segment, amadeusResponse.Dictionaries);
                        flight.ReturnSegments.Add(flightSegment);
                    }
                }

                flights.Add(flight);
            }

            return flights;
        }

        private FlightSegment ConvertSegment(AmadeusSegment amadeusSegment, AmadeusDictionaries dictionaries)
        {
            string carrierName = amadeusSegment.CarrierCode;

            if (dictionaries != null && dictionaries.Carriers != null)
            {
                if (dictionaries.Carriers.ContainsKey(amadeusSegment.CarrierCode))
                {
                    carrierName = dictionaries.Carriers[amadeusSegment.CarrierCode];
                }
            }

            string aircraftType = "";
            if (amadeusSegment.Aircraft != null)
            {
                aircraftType = amadeusSegment.Aircraft.Code;

                if (dictionaries != null && dictionaries.Aircraft != null)
                {
                    if (dictionaries.Aircraft.ContainsKey(amadeusSegment.Aircraft.Code))
                    {
                        aircraftType = dictionaries.Aircraft[amadeusSegment.Aircraft.Code];
                    }
                }
            }

            var segment = new FlightSegment
            {
                DepartureAirportCode = amadeusSegment.Departure.IataCode,
                DepartureDateTime = DateTime.Parse(amadeusSegment.Departure.At),
                ArrivalAirportCode = amadeusSegment.Arrival.IataCode,
                ArrivalDateTime = DateTime.Parse(amadeusSegment.Arrival.At),
                CarrierCode = amadeusSegment.CarrierCode,
                CarrierName = carrierName,
                FlightNumber = amadeusSegment.Number,
                Duration = amadeusSegment.Duration,
                AircraftType = aircraftType
            };

            return segment;
        }
    }
}