using FlightSearchEngine.Models;
using FlightSearchEngine.Services;
using Microsoft.AspNetCore.Mvc;

namespace FlightSearchEngine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightsController : ControllerBase
    {
        private readonly IFlightSearchService _flightService;
        private readonly ILogger<FlightsController> _logger;

        public FlightsController(
            IFlightSearchService flightService,
            ILogger<FlightsController> logger)
        {
            _flightService = flightService;
            _logger = logger;
        }

        [HttpGet("search")]
        public async Task<ActionResult<FlightSearchResult>> SearchFlights(
            [FromQuery] string origin,
            [FromQuery] string destination,
            [FromQuery] DateTime departureDate,
            [FromQuery] DateTime? returnDate = null,
            [FromQuery] int adults = 1,
            [FromQuery] int children = 0,
            [FromQuery] int infants = 0,
            [FromQuery] string travelClass = "ECONOMY",
            [FromQuery] string sortBy = "price",
            [FromQuery] bool? directOnly = null,
            [FromQuery] int? maxStops = null,
            [FromQuery] string departureTimeMin = null,
            [FromQuery] string departureTimeMax = null)
        {
            _logger.LogInformation("Requête recherche: {Origin} -> {Destination}", origin, destination);

            if (string.IsNullOrEmpty(origin))
            {
                return BadRequest(new FlightSearchResult
                {
                    Success = false,
                    ErrorMessage = "Le code de l'aéroport de départ est obligatoire"
                });
            }

            if (string.IsNullOrEmpty(destination))
            {
                return BadRequest(new FlightSearchResult
                {
                    Success = false,
                    ErrorMessage = "Le code de l'aéroport d'arrivée est obligatoire"
                });
            }

            if (departureDate < DateTime.Today)
            {
                return BadRequest(new FlightSearchResult
                {
                    Success = false,
                    ErrorMessage = "La date de départ ne peut pas être dans le passé"
                });
            }

            if (returnDate.HasValue && returnDate < departureDate)
            {
                return BadRequest(new FlightSearchResult
                {
                    Success = false,
                    ErrorMessage = "La date de retour doit être après la date de départ"
                });
            }

            if (adults < 1)
            {
                return BadRequest(new FlightSearchResult
                {
                    Success = false,
                    ErrorMessage = "Il faut au moins un adulte"
                });
            }

            var request = new FlightSearchRequest
            {
                Origin = origin.ToUpper(),
                Destination = destination.ToUpper(),
                DepartureDate = departureDate,
                ReturnDate = returnDate,
                Adults = adults,
                Children = children,
                Infants = infants,
                TravelClass = travelClass.ToUpper()
            };

            var result = await _flightService.SearchFlightsAsync(request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            var filteredFlights = ApplyFilters(
                result.Flights,
                directOnly,
                maxStops,
                departureTimeMin,
                departureTimeMax);

            var sortedFlights = ApplySort(filteredFlights, sortBy);

            result.Flights = sortedFlights;
            result.TotalResults = sortedFlights.Count;

            return Ok(result);
        }

        private List<Flight> ApplyFilters(
            List<Flight> flights,
            bool? directOnly,
            int? maxStops,
            string departureTimeMin,
            string departureTimeMax)
        {
            var filtered = flights.AsEnumerable();

            if (directOnly == true)
            {
                filtered = filtered.Where(f => f.IsDirect);
            }

            if (maxStops.HasValue)
            {
                filtered = filtered.Where(f => f.NumberOfStops <= maxStops.Value);
            }

            if (!string.IsNullOrEmpty(departureTimeMin))
            {
                var minTime = TimeSpan.Parse(departureTimeMin);
                filtered = filtered.Where(f => f.DepartureTime.TimeOfDay >= minTime);
            }

            if (!string.IsNullOrEmpty(departureTimeMax))
            {
                var maxTime = TimeSpan.Parse(departureTimeMax);
                filtered = filtered.Where(f => f.DepartureTime.TimeOfDay <= maxTime);
            }

            return filtered.ToList();
        }

        private List<Flight> ApplySort(List<Flight> flights, string sortBy)
        {
            switch (sortBy.ToLower())
            {
                case "price":
                    return flights.OrderBy(f => f.TotalPrice).ToList();
                case "price_desc":
                    return flights.OrderByDescending(f => f.TotalPrice).ToList();
                case "duration":
                    return flights.OrderBy(f => f.TotalDuration).ToList();
                case "duration_desc":
                    return flights.OrderByDescending(f => f.TotalDuration).ToList();
                case "departure":
                    return flights.OrderBy(f => f.DepartureTime).ToList();
                case "departure_desc":
                    return flights.OrderByDescending(f => f.DepartureTime).ToList();
                case "stops":
                    return flights.OrderBy(f => f.NumberOfStops).ToList();
                default:
                    return flights.OrderBy(f => f.TotalPrice).ToList();
            }
        }

        [HttpGet("airports")]
        public async Task<ActionResult<List<Airport>>> SearchAirports([FromQuery] string keyword)
        {
            _logger.LogInformation("Recherche aéroports: {Keyword}", keyword);

            if (string.IsNullOrEmpty(keyword) || keyword.Length < 2)
            {
                return Ok(new List<Airport>());
            }

            var airports = await _flightService.SearchAirportsAsync(keyword);

            return Ok(airports);
        }

        [HttpGet("classes")]
        public ActionResult<List<object>> GetTravelClasses()
        {
            var classes = new List<object>
            {
                new { Code = "ECONOMY", Name = "Économique" },
                new { Code = "PREMIUM_ECONOMY", Name = "Économique Premium" },
                new { Code = "BUSINESS", Name = "Affaires" },
                new { Code = "FIRST", Name = "Première" }
            };

            return Ok(classes);
        }

        [HttpGet("sort-options")]
        public ActionResult<List<object>> GetSortOptions()
        {
            var options = new List<object>
            {
                new { Code = "price", Name = "Prix croissant" },
                new { Code = "price_desc", Name = "Prix décroissant" },
                new { Code = "duration", Name = "Durée croissante" },
                new { Code = "duration_desc", Name = "Durée décroissante" },
                new { Code = "departure", Name = "Heure de départ" },
                new { Code = "stops", Name = "Nombre d'escales" }
            };

            return Ok(options);
        }
    }
}