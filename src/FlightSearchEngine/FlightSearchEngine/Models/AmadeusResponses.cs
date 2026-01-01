using Newtonsoft.Json;

namespace FlightSearchEngine.Models
{
    public class AmadeusTokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("token_type")]
        public string TokenType { get; set; }

        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }
    }

    public class AmadeusFlightOffersResponse
    {
        [JsonProperty("data")]
        public List<AmadeusFlightOffer> Data { get; set; }

        [JsonProperty("dictionaries")]
        public AmadeusDictionaries Dictionaries { get; set; }
    }

    public class AmadeusFlightOffer
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("itineraries")]
        public List<AmadeusItinerary> Itineraries { get; set; }

        [JsonProperty("price")]
        public AmadeusPrice Price { get; set; }

        [JsonProperty("travelerPricings")]
        public List<AmadeusTravelerPricing> TravelerPricings { get; set; }
    }

    public class AmadeusItinerary
    {
        [JsonProperty("duration")]
        public string Duration { get; set; }

        [JsonProperty("segments")]
        public List<AmadeusSegment> Segments { get; set; }
    }

    public class AmadeusSegment
    {
        [JsonProperty("departure")]
        public AmadeusLocation Departure { get; set; }

        [JsonProperty("arrival")]
        public AmadeusLocation Arrival { get; set; }

        [JsonProperty("carrierCode")]
        public string CarrierCode { get; set; }

        [JsonProperty("number")]
        public string Number { get; set; }

        [JsonProperty("duration")]
        public string Duration { get; set; }

        [JsonProperty("aircraft")]
        public AmadeusAircraft Aircraft { get; set; }
    }

    public class AmadeusLocation
    {
        [JsonProperty("iataCode")]
        public string IataCode { get; set; }

        [JsonProperty("terminal")]
        public string Terminal { get; set; }

        [JsonProperty("at")]
        public string At { get; set; }
    }

    public class AmadeusPrice
    {
        [JsonProperty("total")]
        public string Total { get; set; }

        [JsonProperty("currency")]
        public string Currency { get; set; }

        [JsonProperty("grandTotal")]
        public string GrandTotal { get; set; }
    }

    public class AmadeusAircraft
    {
        [JsonProperty("code")]
        public string Code { get; set; }
    }

    public class AmadeusTravelerPricing
    {
        [JsonProperty("travelerType")]
        public string TravelerType { get; set; }

        [JsonProperty("price")]
        public AmadeusTravelerPrice Price { get; set; }

        [JsonProperty("fareDetailsBySegment")]
        public List<AmadeusFareDetails> FareDetailsBySegment { get; set; }
    }

    public class AmadeusTravelerPrice
    {
        [JsonProperty("total")]
        public string Total { get; set; }

        [JsonProperty("currency")]
        public string Currency { get; set; }
    }

    public class AmadeusFareDetails
    {
        [JsonProperty("cabin")]
        public string Cabin { get; set; }

        [JsonProperty("class")]
        public string Class { get; set; }
    }

    public class AmadeusDictionaries
    {
        [JsonProperty("carriers")]
        public Dictionary<string, string> Carriers { get; set; }

        [JsonProperty("aircraft")]
        public Dictionary<string, string> Aircraft { get; set; }
    }

    public class AmadeusAirportSearchResponse
    {
        [JsonProperty("data")]
        public List<AmadeusAirportData> Data { get; set; }
    }

    public class AmadeusAirportData
    {
        [JsonProperty("iataCode")]
        public string IataCode { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("address")]
        public AmadeusAddress Address { get; set; }
    }

    public class AmadeusAddress
    {
        [JsonProperty("cityName")]
        public string CityName { get; set; }

        [JsonProperty("countryName")]
        public string CountryName { get; set; }
    }

    public class AmadeusErrorResponse
    {
        [JsonProperty("errors")]
        public List<AmadeusError> Errors { get; set; }
    }

    public class AmadeusError
    {
        [JsonProperty("status")]
        public int Status { get; set; }

        [JsonProperty("code")]
        public int Code { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("detail")]
        public string Detail { get; set; }
    }
}