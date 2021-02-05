using Microsoft.AspNetCore.Mvc;
using MysqlWebDataManager.Service.IService;
using Newtonsoft.Json;
using System;
using System.Linq;

namespace MysqlWebDataManager.Controllers
{
    [Route("[controller]/[action]")]
    public class MrgController : Controller
    {
        private readonly IMrgService _service;
        private readonly IConnectionInfoService _connectionInfoService;
        public MrgController(IMrgService service, IConnectionInfoService connectionInfoService)
        {
            _service = service;
            _connectionInfoService = connectionInfoService;
        }

        public IActionResult Index()
        {
            string tableName = Request.Query["tableName"];
            string pageNumberRaw = Request.Query["pageNumber"];
            int pageNumber = 0;
            if (!string.IsNullOrWhiteSpace(pageNumberRaw))
            {
                pageNumber = Convert.ToInt32(pageNumberRaw) - 1;
            }
            var cols = _service.GetColumns(tableName);
            var ds = _service.GetMrgPageData(tableName, pageNumber, cols.Select(x => x.DbColumnName).ToArray());
            ViewBag.TableInfo = _service.GetTableNames().Where(x => x.Name == tableName).FirstOrDefault();
            ViewBag.ColumnsInfo = cols;
            ViewBag.Keys = _service.GetPrimaries(tableName);
            ViewBag.Rows = ds.Tables[1].Rows;
            ViewBag.CurrentPage = pageNumber + 1;
            ViewBag.TotalNumber = Convert.ToInt32(ds.Tables[0].Rows[0]["count"]);
            return View();
        }

        public IActionResult ModalView()
        {
            ViewBag.TableList = _service.GetTableNames();
            return View();
        }

        public IActionResult GetColumnsByTableName(string tableName)
        {
            return Ok(_service.GetColumns(tableName));
        }

        public IActionResult GetOthersData()
        {
            string tableName = Request.Form["tableName"];
            string pageNumberRaw = Request.Form["pageNumber"];
            int pageNumber = 0;
            if (int.TryParse(pageNumberRaw, out int pn))
            {
                if (pn > 0)
                {
                    pageNumber = pn - 1;
                }
            }
            var result = _service.GetMrgPageData(tableName, pageNumber);
            var columns = _service.GetColumns(tableName);
            if (result != null && result.Tables[1].Rows.Count > 0)
            {
                return Ok(new { columns, data = JsonConvert.SerializeObject(result.Tables[1].Rows[0].Table), TotalNumber = result.Tables[0].Rows[0]["count"], CurrentPage = pageNumber + 1 });
            }
            return Ok(new { columns, TotalNumber = result.Tables[0].Rows[0]["count"], CurrentPage = pageNumber + 1 });
        }
        public IActionResult AddItem()
        {
            var parms = Request.Form;
            var res = _service.AddItem(parms);
            return Ok(new { res.result, res.message });
        }

        public IActionResult EditItem()
        {
            var parms = Request.Form;
            var res = _service.EditItem(parms);
            return Ok(new { res.result, res.message });
        }

        public IActionResult GetItemById()
        {
            var parms = Request.Form;
            var res = _service.GetItemById(parms);
            if (res.result)
            {
                return Ok(new { res.result, res.message, data = JsonConvert.SerializeObject(res.data.Rows[0].Table) });
            }
            return Ok(new { res.result, res.message });
        }

        public IActionResult IsSetStatusKeyWord()
        {
            var form = Request.Form;
            var res = _connectionInfoService.IsSetStatusKeyWord(form);
            return Ok(new { res.result, res.message });
        }

        public IActionResult EnableOrDisableItem()
        {
            var form = Request.Form;
            var tableInfo = _connectionInfoService.GetTableInfo(form);
            var res = _service.EnableOrDisableItem(form, tableInfo);
            return Ok(new { res.result, res.message });
        }

        public IActionResult SetStatusKeyWord()
        {
            var form = Request.Form;
            var res = _connectionInfoService.SetStatusKeyWord(form);
            return Ok(new { res.result, res.message });
        }

        public IActionResult DeleteItems()
        {
            var form = Request.Form;
            var res = _service.DeleteItems(form);
            return Ok(new { res.result, res.message });
        }

    }
}