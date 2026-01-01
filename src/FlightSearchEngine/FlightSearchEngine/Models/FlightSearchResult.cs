namespace FlightSearchEngine.Models
{
    public class FlightSearchResult
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public List<Flight> Flights { get; set; }
        public int TotalResults { get; set; }
        public DateTime SearchTimestamp { get; set; }
        public FlightSearchRequest OriginalRequest { get; set; }

        public FlightSearchResult()
        {
            Flights = new List<Flight>();
            SearchTimestamp = DateTime.UtcNow;
            Success = false;
        }
    }
}