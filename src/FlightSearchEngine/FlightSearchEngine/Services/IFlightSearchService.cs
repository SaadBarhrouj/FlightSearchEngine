using FlightSearchEngine.Models;

namespace FlightSearchEngine.Services
{
    public interface IFlightSearchService
    {
        Task<FlightSearchResult> SearchFlightsAsync(FlightSearchRequest request);
        Task<List<Airport>> SearchAirportsAsync(string keyword);
    }
}