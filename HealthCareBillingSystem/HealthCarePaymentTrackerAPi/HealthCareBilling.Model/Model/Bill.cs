using System;
using System.Collections.Generic;

namespace HealthCareBilling.Model
{
    public class Bill
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public DateTime? BillDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<BillItem> BillItems { get; set; } = new List<BillItem>();
    }

    public class BillItem
    {
        public int Id { get; set; }
        public int BillId { get; set; }
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalAmount { get; set; }
    }
}