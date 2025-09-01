using Microsoft.AspNetCore.Mvc;
using HealthCareBilling.Model;
using HealthCareBilling.Data.Data;
using Dapper;
using System.Data;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;

namespace HealthCareBillingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientController : ControllerBase
    {
        private readonly DapperContext _context;
        private readonly ILogger<PatientController> _logger;

        public PatientController(DapperContext context, ILogger<PatientController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("PatientList/{type}")]
        public async Task<ActionResult<GetResponse<Patient>>> PatientList([FromRoute] string type)
        {
            try
            {
                _logger.LogInformation("Fetching patient list with type: {Type}", type);
                
                var result = await PatientListData(type);
                
                if (result.response.ReturnNumber != 0)
                {
                    _logger.LogWarning("Patient list retrieval completed with warning: {Error}", result.response.ErrorMessage);
                    return BadRequest(new { message = result.response.ErrorMessage });
                }
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch patient data");
                return StatusCode(500, new { message = "Failed to fetch patient data", error = ex.Message });
            }
        }

        private async Task<GetResponse<Patient>> PatientListData(string type)
        {
            GetResponse<Patient> result = new GetResponse<Patient>
            {
                response = new ResponseModel()
            };
            
            var parameters = new DynamicParameters();
            parameters.Add("@Type_i", type, DbType.String, ParameterDirection.Input);
            parameters.Add("@rtn_o", dbType: DbType.Int32, direction: ParameterDirection.Output);
            parameters.Add("@Errormsg_o", dbType: DbType.String, size: 1000, direction: ParameterDirection.Output);

            var query = "usp_GetPatientList";
            using (var connection = _context.CreateConnection())
            {
                var results = await connection.QueryAsync(query, param: parameters, commandType: CommandType.StoredProcedure);
                var json = JsonConvert.SerializeObject(results);

                result.value = JsonConvert.DeserializeObject<List<Patient>>(json);
                result.response.ReturnNumber = parameters.Get<int>("@rtn_o");
                result.response.ErrorMessage = parameters.Get<string>("@Errormsg_o") ?? string.Empty;
                return result;
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> GetPatient(int id)
        {
            try
            {
                _logger.LogInformation("Fetching patient with ID: {Id}", id);
                
                var query = @"SELECT * FROM Patients WHERE Id = @Id";
                
                using var connection = _context.CreateConnection();
                var patient = await connection.QueryFirstOrDefaultAsync<Patient>(query, new { Id = id });
                
                if (patient == null)
                {
                    return NotFound(new { message = "Patient not found" });
                }
                
                return Ok(patient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch patient with ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to fetch patient", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreatePatient([FromBody] Patient patient)
        {
            try
            {
                _logger.LogInformation("Creating new patient: {FirstName} {LastName}", patient.FirstName, patient.LastName);
                
                var query = @"INSERT INTO Patients (FirstName, LastName, DateOfBirth, Email, Phone, Address, InsuranceProvider, InsurancePolicyNumber, CreatedAt, UpdatedAt)
                             OUTPUT INSERTED.Id
                             VALUES (@FirstName, @LastName, @DateOfBirth, @Email, @Phone, @Address, @InsuranceProvider, @InsurancePolicyNumber, GETDATE(), GETDATE())";
                
                using var connection = _context.CreateConnection();
                var patientId = await connection.ExecuteScalarAsync<int>(query, patient);
                
                _logger.LogInformation("Patient created successfully with ID: {Id}", patientId);
                return Ok(new { Id = patientId, Message = "Patient created successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create patient");
                return StatusCode(500, new { message = "Failed to create patient", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, [FromBody] Patient patient)
        {
            try
            {
                _logger.LogInformation("Updating patient with ID: {Id}", id);
                
                // Check if patient exists
                var checkQuery = "SELECT COUNT(1) FROM Patients WHERE Id = @Id";
                using var connection = _context.CreateConnection();
                var exists = await connection.ExecuteScalarAsync<bool>(checkQuery, new { Id = id });
                
                if (!exists)
                {
                    return NotFound(new { message = "Patient not found" });
                }
                
                var updateQuery = @"UPDATE Patients SET 
                                    FirstName = @FirstName, 
                                    LastName = @LastName, 
                                    DateOfBirth = @DateOfBirth, 
                                    Email = @Email, 
                                    Phone = @Phone, 
                                    Address = @Address, 
                                    InsuranceProvider = @InsuranceProvider, 
                                    InsurancePolicyNumber = @InsurancePolicyNumber, 
                                    UpdatedAt = GETDATE()
                                 WHERE Id = @Id";
                
                await connection.ExecuteAsync(updateQuery, new
                {
                    patient.FirstName,
                    patient.LastName,
                    patient.DateOfBirth,
                    patient.Email,
                    patient.Phone,
                    patient.Address,
                    patient.InsuranceProvider,
                    patient.InsurancePolicyNumber,
                    Id = id
                });
                
                _logger.LogInformation("Patient with ID: {Id} updated successfully", id);
                return Ok(new { Message = "Patient updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update patient with ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to update patient", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            try
            {
                _logger.LogInformation("Deleting patient with ID: {Id}", id);
                
                var query = "DELETE FROM Patients WHERE Id = @Id";
                
                using var connection = _context.CreateConnection();
                var affectedRows = await connection.ExecuteAsync(query, new { Id = id });
                
                if (affectedRows == 0)
                {
                    return NotFound(new { message = "Patient not found" });
                }
                
                _logger.LogInformation("Patient with ID: {Id} deleted successfully", id);
                return Ok(new { Message = "Patient deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete patient with ID: {Id}", id);
                return StatusCode(500, new { message = "Failed to delete patient", error = ex.Message });
            }
        }
    }

    public class GetResponse<T>
    {
        public List<T> value { get; set; } = new List<T>();
        public ResponseModel response { get; set; } = new ResponseModel();
    }

    public class ResponseModel
    {
        public int ReturnNumber { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }
}