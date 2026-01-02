namespace FlightSearchEngine.Models
{
    public class Flight
    {
        public string Id { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal PricePerAdult { get; set; }
        public string Currency { get; set; }
        public string TotalDuration { get; set; }
        public int NumberOfStops { get; set; }
        public List<FlightSegment> OutboundSegments { get; set; }
        public List<FlightSegment> ReturnSegments { get; set; }

        public Flight()
        {
            OutboundSegments = new List<FlightSegment>();
            ReturnSegments = new List<FlightSegment>();
        }

        public bool IsDirect
        {
            get
            {
                return NumberOfStops == 0;
            }
        }

        public DateTime DepartureTime
        {
            get
            {
                if (OutboundSegments != null && OutboundSegments.Count > 0)
                {
                    return OutboundSegments[0].DepartureDateTime;
                }
                return DateTime.MinValue;
            }
        }

        public DateTime ArrivalTime
        {
            get
            {
                if (OutboundSegments != null && OutboundSegments.Count > 0)
                {
                    return OutboundSegments[OutboundSegments.Count - 1].ArrivalDateTime;
                }
                return DateTime.MinValue;
            }
        }

        public string MainCarrierCode
        {
            get
            {
                if (OutboundSegments != null && OutboundSegments.Count > 0)
                {
                    return OutboundSegments[0].CarrierCode;
                }
                return "";
            }
        }

        public string MainCarrierName
        {
            get
            {
                if (OutboundSegments != null && OutboundSegments.Count > 0)
                {
                    return OutboundSegments[0].CarrierName;
                }
                return "";
            }
        }

        public string FormattedTotalDuration
        {
            get
            {
                if (string.IsNullOrEmpty(TotalDuration))
                {
                    return "";
                }

                string result = TotalDuration.Replace("PT", "");
                result = result.Replace("H", "h ");
                result = result.Replace("M", "min");
                return result;
            }
        }

        public string FormattedPrice
        {
            get
            {
                return TotalPrice.ToString("N2") + " " + Currency;
            }
        }

        public string StopsDescription
        {
            get
            {
                if (NumberOfStops == 0)
                {
                    return "Direct";
                }
                else if (NumberOfStops == 1)
                {
                    return "1 escale";
                }
                else
                {
                    return NumberOfStops + " escales";
                }
            }
        }
    }
}