namespace FlightSearchEngine.Models
{
    public class FlightSearchRequest
    {
        public string Origin { get; set; }
        public string Destination { get; set; }
        public DateTime DepartureDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public int Adults { get; set; }
        public int Children { get; set; }
        public int Infants { get; set; }
        public string TravelClass { get; set; }

        public FlightSearchRequest()
        {
            Adults = 1;
            Children = 0;
            Infants = 0;
            TravelClass = "ECONOMY";
        }

        public bool IsRoundTrip
        {
            get
            {
                return ReturnDate.HasValue;
            }
        }

        public int TotalPassengers
        {
            get
            {
                return Adults + Children + Infants;
            }
        }
    }
}