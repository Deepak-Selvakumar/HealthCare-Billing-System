using Microsoft.AspNetCore.Mvc;
using HealthCareBilling.Model;
using HealthCareBilling.Data.Data;
using Dapper;
using System.Data;
using Newtonsoft.Json;

namespace HealthCareBillingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillController : ControllerBase
    {
        private readonly DapperContext _context;

        public BillController(DapperContext context)
        {
            _context = context;
        }

        [HttpGet("BillList/{patientId}")]
        public ActionResult BillList([FromRoute] int patientId)
        {
            try
            {
                var tokenvalue = Request.Headers["Authorization"];
                if (tokenvalue.Count == 0 || !tokenvalue[0].StartsWith("Bearer "))
                    return Unauthorized("Invalid token");
                
                string token = tokenvalue[0].Split("Bearer ")[1];
                // var userdet = _tokendecode.TokenDecodeFromString(token);
                
                var result = BillListData(patientId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch bill data", error = ex.Message });
            }
        }

        private GetResponse<Bill> BillListData(int patientId)
        {
            try
            {
                GetResponse<Bill> result = new GetResponse<Bill>
                {
                    response = new ResponseModel()
                };
                
                var parameters = new DynamicParameters();
                parameters.Add("@PatientId_i", patientId, DbType.Int32, ParameterDirection.Input);
                parameters.Add("@rtn_o", null, DbType.Int32, ParameterDirection.Output);
                parameters.Add("@Errormsg_o", null, DbType.String, ParameterDirection.Output, 1000);

                var query = "usp_GetBillListByPatient";
                using (var connection = _context.CreateConnection())
                {
                    var results = connection.Query(query, param: parameters, commandType: CommandType.StoredProcedure).ToList();
                    var json = JsonConvert.SerializeObject(results);

                    result.value = JsonConvert.DeserializeObject<List<Bill>>(json);
                    result.response.ReturnNumber = parameters.Get<int>("rtn_o");
                    result.response.ErrorMessage = parameters.Get<string>("Errormsg_o") ?? "0";
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpPost("CreateBill")]
        public async Task<IActionResult> CreateBill([FromBody] Bill bill)
        {
            try
            {
                using var connection = _context.CreateConnection();
                connection.Open();
                using var transaction = connection.BeginTransaction();
                
                try
                {
                    // Insert bill
                    var billQuery = @"INSERT INTO Bills (PatientId, BillDate, DueDate, TotalAmount, Status, Description, CreatedAt, UpdatedAt)
                                     OUTPUT INSERTED.Id
                                     VALUES (@PatientId, @BillDate, @DueDate, @TotalAmount, @Status, @Description, GETDATE(), GETDATE())";
                    
                    var billId = await connection.ExecuteScalarAsync<int>(billQuery, new {
                        bill.PatientId,
                        bill.BillDate,
                        bill.DueDate,
                        bill.TotalAmount,
                        bill.Status,
                        bill.Description
                    }, transaction);
                    
                    // Insert bill items
                    foreach (var item in bill.BillItems)
                    {
                        var itemQuery = @"INSERT INTO BillItems (BillId, Description, Quantity, UnitPrice, TotalAmount)
                                         VALUES (@BillId, @Description, @Quantity, @UnitPrice, @TotalAmount)";
                        
                        await connection.ExecuteAsync(itemQuery, new {
                            BillId = billId,
                            item.Description,
                            item.Quantity,
                            item.UnitPrice,
                            item.TotalAmount
                        }, transaction);
                    }
                    
                    transaction.Commit();
                    return Ok(new { Id = billId, Message = "Bill created successfully" });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500, new { message = "Failed to create bill", error = ex.Message });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create bill", error = ex.Message });
            }
        }
    }
}