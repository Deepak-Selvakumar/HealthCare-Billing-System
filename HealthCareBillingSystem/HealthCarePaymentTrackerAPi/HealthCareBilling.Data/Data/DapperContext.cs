using Microsoft.Extensions.Configuration;
using System.Data;
using Microsoft.Data.SqlClient;

namespace HealthCareBilling.Data.Data
{
    public class DapperContext
    {
        private readonly string _connectionString;

        public DapperContext(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            
            if (string.IsNullOrEmpty(_connectionString))
            {
                throw new ArgumentNullException(nameof(_connectionString), 
                    "Connection string is null or empty. Check your appsettings.json ConnectionStrings section");
            }
        }

        public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
        
        // Helper method for debugging
        public string GetConnectionString() => _connectionString;
    }
}