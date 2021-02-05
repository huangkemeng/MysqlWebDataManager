using System.Text.Json;

namespace MysqlWebDataManager.Models
{
    public class CamelCasing : JsonNamingPolicy
    {
        public override string ConvertName(string name)
        {
            return name;
        }
    }
}
