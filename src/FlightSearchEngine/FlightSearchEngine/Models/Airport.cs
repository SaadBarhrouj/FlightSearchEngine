namespace FlightSearchEngine.Models
{
    public class Airport
    {
        public string IataCode { get; set; }
        public string Name { get; set; }
        public string CityName { get; set; }
        public string CountryName { get; set; }

        public string DisplayName
        {
            get
            {
                return CityName + " - " + Name + " (" + IataCode + ")";
            }
        }
    }
}