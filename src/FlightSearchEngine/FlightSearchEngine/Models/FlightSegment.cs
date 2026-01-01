namespace FlightSearchEngine.Models
{
    public class FlightSegment
    {
        public string DepartureAirportCode { get; set; }
        public string DepartureAirportName { get; set; }
        public string DepartureCityName { get; set; }
        public DateTime DepartureDateTime { get; set; }

        public string ArrivalAirportCode { get; set; }
        public string ArrivalAirportName { get; set; }
        public string ArrivalCityName { get; set; }
        public DateTime ArrivalDateTime { get; set; }

        public string CarrierCode { get; set; }
        public string CarrierName { get; set; }
        public string FlightNumber { get; set; }
        public string Duration { get; set; }
        public string AircraftType { get; set; }
        public string CabinClass { get; set; }

        public string FormattedDepartureTime
        {
            get
            {
                return DepartureDateTime.ToString("HH:mm");
            }
        }

        public string FormattedArrivalTime
        {
            get
            {
                return ArrivalDateTime.ToString("HH:mm");
            }
        }

        public string FormattedDuration
        {
            get
            {
                if (string.IsNullOrEmpty(Duration))
                {
                    return "";
                }

                string result = Duration.Replace("PT", "");
                result = result.Replace("H", "h ");
                result = result.Replace("M", "min");
                return result;
            }
        }
    }
}