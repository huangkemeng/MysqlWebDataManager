$(document).ready(function () {
    $(".datetimepicker").datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        weekStart: 1,
        todayBtn: true,
        autoclose: 1,
        todayHighlight: true,
        startView: 2,
        minView: 0,
        initialDate: new Date()
    });
    $(".goto-page").bind("keypress", function (event) {
        if (event.keyCode == 13) {
            var TableName = $("[data-isTable]").attr("data-TableName").toString();
            location.href = "/Mrg/Index?tableName=" + TableName + "&pageNumber=" + $(this).val();
        }
    });
});
var mrg;
(function (mrg) {
    function AddItem() {
        var columns = GetColumnValues();
        if (!columns.ready) {
            return;
        }
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/AddItem',
            data: columns.data,
            //数据，json字符串
            success: function (res) {
                if (res.result) {
                    alert(res.message);
                    location.reload();
                }
                else {
                    alert(res.message);
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("创建失败");
            }
        });
    }
    mrg.AddItem = AddItem;
    function EditItem() {
        var columns = GetColumnValues();
        if (!columns.ready) {
            return;
        }
        var checkeds = $(".row-checkbox:checked");
        if (checkeds.length === 0) {
            return alert("请勾选你要编辑数据");
        }
        if (checkeds.length > 1) {
            return alert("每次只能编辑一行数据");
        }
        var kindexs = GetKeysAndIndexs();
        var ids = [];
        kindexs.forEach(function (value, index) {
            var _a;
            ids.push((_a = {}, _a[value.key] = checkeds.parent().siblings("th").eq(value.value)[0].innerText, _a));
        });
        columns.data["Ids"] = JSON.stringify(ids);
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/EditItem',
            data: columns.data,
            //数据，json字符串
            success: function (res) {
                if (res.result) {
                    alert(res.message);
                    location.reload();
                }
                else {
                    alert(res.message);
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("创建失败");
            }
        });
    }
    mrg.EditItem = EditItem;
    function ShowAdd() {
        $('[data-isColumn]').val('');
        $("#Modal").find(".modal-title").text("新增");
        $("#Modal").modal("show");
        $(".edit-add-btn").attr("onclick", "mrg.AddItem()");
    }
    mrg.ShowAdd = ShowAdd;
    function CheckAllChange(ele) {
        if (ele.checked) {
            $(".row-checkbox").prop('checked', true);
        }
        else {
            $(".row-checkbox").prop('checked', false);
        }
    }
    mrg.CheckAllChange = CheckAllChange;
    function GetColumnValues() {
        var data = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
        var notnull_columns = [];
        $('[data-isColumn]').each(function () {
            var key = $(this).attr("data-DbColumnName").toString();
            var value = $(this).val().toString();
            data[key] = value;
            if ($(this).attr("required") && value.trim().length === 0) {
                notnull_columns.push(key);
            }
        });
        if (notnull_columns.length > 0) {
            alert("\u4EE5\u4E0B\u4E3A\u5FC5\u586B\u5B57\u6BB5\uFF0C\u8BF7\u4E0D\u8981\u7559\u7A7A\r\n" + notnull_columns.join("\r\n"));
        }
        return { ready: notnull_columns.length == 0, data: data };
    }
    mrg.GetColumnValues = GetColumnValues;
    function ShowEdit() {
        var checkeds = $(".row-checkbox:checked");
        if (checkeds.length === 0) {
            return alert("请勾选你要编辑数据");
        }
        if (checkeds.length > 1) {
            return alert("每次只能编辑一行数据");
        }
        var data = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
        var kindexs = GetKeysAndIndexs();
        kindexs.forEach(function (value, index) {
            data[value.key] = checkeds.parent().siblings("th").eq(value.value)[0].innerText;
        });
        $("#Modal").find(".modal-title").text("编辑");
        $(".edit-add-btn").attr("onclick", "mrg.EditItem()");
        GetItemById(data);
    }
    mrg.ShowEdit = ShowEdit;
    function GetItemById(data) {
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/GetItemById',
            data: data,
            dataType: "json",
            //数据，json字符串
            success: function (res) {
                if (res.result) {
                    var data_1 = JSON.parse(res.data)[0];
                    $("[data-isColumn]").each(function () {
                        $(this).val(data_1[$(this).attr("data-DbColumnName").toString()]);
                    });
                    $("#Modal").modal("show");
                }
                else {
                    alert(res.message);
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("获取数据失败");
            }
        });
    }
    mrg.GetItemById = GetItemById;
    function GetKeysAndIndexs() {
        var indexs = [];
        $("#data_table>thead>tr").find('th[data-iskey]').each(function () {
            var keyname = $(this).attr("data-dbcolumnname").toString();
            indexs.push({ key: keyname, value: $(this).index() - 1 });
        });
        return indexs;
    }
    function GetCheckedIds() {
        var kindexs = GetKeysAndIndexs();
        var checkeds = $(".row-checkbox:checked");
        var many_ids = [];
        checkeds.each(function () {
            var checked = $(this);
            var ids = [];
            kindexs.forEach(function (value, index) {
                var _a;
                ids.push((_a = {}, _a[value.key] = checked.parent().siblings("th").eq(value.value)[0].innerText, _a));
            });
            many_ids.push(ids);
        });
        return many_ids;
    }
    function SetDefaultValue(ele) {
        var defaultvalue = $(ele).attr("data-DefaultValue").toString();
        $(ele).siblings("[data-isColumn]").val(defaultvalue);
    }
    mrg.SetDefaultValue = SetDefaultValue;
    function IsSetStatusKeyWord(status) {
        var data = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/IsSetStatusKeyWord',
            data: data,
            //数据，json字符串
            success: function (res) {
                if (!res.result) {
                    var con = confirm("请告诉我哪个是启用或禁用的字段！");
                    if (con) {
                        $('#StatusKeyWord').val('');
                        $('#KeyWordOn').val('');
                        $('#KeyWordOff').val('');
                        $("#SetStatusModal").modal('show');
                    }
                }
                else {
                    data["Status"] = status;
                    EnableOrDisableItem(data);
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求出错");
            }
        });
    }
    mrg.IsSetStatusKeyWord = IsSetStatusKeyWord;
    function EnableOrDisableItem(data) {
        var checkeds = $(".row-checkbox:checked");
        var text = data["Status"] === 1 ? "启用" : "禁用";
        if (checkeds.length === 0) {
            return alert("\u8BF7\u52FE\u9009\u4F60\u8981" + text + "\u7684\u6570\u636E");
        }
        data["Ids"] = JSON.stringify(GetCheckedIds());
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/EnableOrDisableItem',
            data: data,
            //数据，json字符串
            success: function (res) {
                alert(res.message);
                if (res.result) {
                    location.reload();
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求出错");
            }
        });
    }
    function SetStatusKeyWord() {
        var data = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
        var StatusKeyWord = $('#StatusKeyWord').val().toString();
        var KeyWordOn = $('#KeyWordOn').val().toString();
        var KeyWordOff = $('#KeyWordOff').val().toString();
        if (StatusKeyWord.length == 0) {
            return alert('请指定一个关键字');
        }
        if (KeyWordOn.length == 0) {
            return alert('请指定启用时的值');
        }
        if (KeyWordOff.length == 0) {
            return alert('请指定禁用时的值');
        }
        data["StatusKeyWord"] = StatusKeyWord;
        data["KeyWordOn"] = KeyWordOn;
        data["KeyWordOff"] = KeyWordOff;
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/SetStatusKeyWord',
            data: data,
            //数据，json字符串
            success: function (res) {
                alert(res.message);
                if (res.result) {
                    location.reload();
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求出错");
            }
        });
    }
    mrg.SetStatusKeyWord = SetStatusKeyWord;
    function DeleteItems() {
        var checkeds = $(".row-checkbox:checked");
        if (checkeds.length === 0) {
            return alert("\u8BF7\u52FE\u9009\u4F60\u8981\u5220\u9664\u7684\u6570\u636E");
        }
        var con = confirm("确定删除吗，一旦删除将无法找回！");
        if (!con) {
            return;
        }
        var data = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
        data["Ids"] = JSON.stringify(GetCheckedIds());
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/DeleteItems',
            data: data,
            //数据，json字符串
            success: function (res) {
                alert(res.message);
                if (res.result) {
                    location.reload();
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求出错");
            }
        });
    }
    mrg.DeleteItems = DeleteItems;
    function FromOthers(ele) {
        $("#DynamicModal").load('/Mrg/ModalView', function () {
            $("#DynamicModal").modal('show');
            GetColumnsByTableName();
            $("#TableNames").change(function () {
                GetColumnsByTableName();
            });
            $("#ChooseOtherData").unbind("click");
            $("#ChooseOtherData").click(function () {
                var column = $("#ColumnNames").val();
                var value = $(".otherdata-radio:checked").parent('th').siblings("[data-dbcolumnname=\"" + column + "\"]").text();
                $(ele).siblings("[data-iscolumn]").val(value);
                $("#DynamicModal").modal('hide');
            });
        });
    }
    mrg.FromOthers = FromOthers;
    function GetColumnsByTableName() {
        var TableName = $("#TableNames").val();
        if (!TableName) {
            return;
        }
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/GetColumnsByTableName',
            data: { tableName: TableName },
            //数据，json字符串
            success: function (res) {
                console.log(res);
                var columns = res;
                if (columns.length > 0) {
                    var columnsOPtions = columns.map(function (value, index) {
                        var IsPrimarykey = value["IsPrimarykey"];
                        var selected = IsPrimarykey ? "selected" : "";
                        return "<option value=\"" + value["DbColumnName"] + "\" " + selected + ">" + value["DbColumnName"] + "</option>";
                    });
                    $("#ColumnNames").children('option').length > 0 && $("#ColumnNames").empty();
                    $("#ColumnNames").append(columnsOPtions.join(''));
                    GetOthersData(1);
                }
                else {
                    alert("找不到相关的任何字段！");
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求出错");
            }
        });
    }
    function GetOthersData(pageNumber) {
        var TableName = $("#TableNames").val().toString();
        if (TableName.length === 0) {
            return;
        }
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Mrg/GetOthersData',
            data: { tableName: TableName, pageNumber: pageNumber },
            //数据，json字符串
            success: function (res) {
                $("#OtherThead>tr").children().length > 0 && $("#OtherThead>tr").empty();
                $("#OtherTbody").children().length > 0 && $("#OtherTbody").empty();
                $("#OtherPagination").children().length > 0 && $("#OtherPagination").empty();
                var columns = res.columns;
                var columns_th = columns.map(function (value) {
                    var DbColumnName = value["ColumnDescription"] || value["DbColumnName"];
                    return "<th>" + DbColumnName + "</th>";
                });
                var columns_raw = "<th></th>" + columns_th.join("");
                $("#OtherThead>tr").append(columns_raw);
                if (res.data) {
                    var data = JSON.parse(res.data);
                    if (data.length > 0) {
                        var rows_th = data.map(function (row) {
                            var row_th = columns.map(function (col) {
                                return "<th data-DbColumnName=\"" + col["DbColumnName"] + "\">" + row[col["DbColumnName"]] + "</th>";
                            });
                            var row_raw = "<tr><th scope=\"row\"><input name=\"otherdata\" class=\"custom-radio otherdata-radio\" type=\"radio\"/></th>" + row_th.join("") + "</tr>";
                            return row_raw;
                        });
                        $("#OtherTbody").append(rows_th.join(""));
                    }
                    else {
                        $("#OtherTbody").append('<center style="color:gray">没有任何数据</center>');
                    }
                }
                var CurrentPage = Number(res.CurrentPage);
                var TotalNumber = Number(res.TotalNumber);
                var pageSize = 15;
                var previou_raw = '';
                var next_raw = '';
                for (var i = 5; i >= 1; i--) {
                    var previou_page = CurrentPage - i;
                    if (previou_page > 0) {
                        previou_raw += "<li class=\"page-item\" title=\"\u7B2C" + previou_page + "\u9875\"><a class=\"page-link\" onclick=\"mrg.GetOthersData('" + previou_page + "')\">" + previou_page + "</a></li>";
                    }
                }
                for (var i = 1; i <= 5; i++) {
                    var next_page = CurrentPage + i;
                    if (next_page * pageSize - TotalNumber < 15) {
                        next_raw += "<li class=\"page-item\" title=\"\u7B2C" + next_page + "\u9875\"><a class=\"page-link\" onclick=\"mrg.GetOthersData('" + next_page + "')\">" + next_page + "</a></li>";
                    }
                }
                var page_raw = "\n                    <li class=\"page-item\" style=\"width:35%\"><input style=\"width:100%\" class=\"page-link text-muted others-goto-page\" type=\"number\" placeholder=\"\u9875\u7801\" value=\"" + CurrentPage + "\" /></li>\n                    <li class=\"page-item " + (CurrentPage == 1 ? "disabled" : "") + "\" title=\"\u9996\u9875\"><a class=\"page-link\" onclick=\"mrg.GetOthersData('1')\">&laquo;</a></li>\n                    <li class=\"page-item " + (CurrentPage == 1 ? "disabled" : "") + "\" title=\"\u4E0A\u4E00\u9875\"><a class=\"page-link\" onclick=\"mrg.GetOthersData('" + (CurrentPage > 1 ? CurrentPage - 1 : 1) + "')\">&lsaquo;</a></li>\n                     " + previou_raw + "\n                    <li class=\"page-item active\" title=\"\u5F53\u524D\u9875\"><a class=\"page-link\">" + CurrentPage + "</a></li>\n                    " + next_raw + "\n                    <li title=\"\u4E0B\u4E00\u9875\" class=\"page-item " + (TotalNumber <= CurrentPage * pageSize ? "disabled" : "") + "\"><a class=\"page-link\" onclick=\"mrg.GetOthersData('" + (CurrentPage + 1) + "')\">&rsaquo;</a></li>\n                    <li title=\"\u6700\u540E\u4E00\u9875\" class=\"page-item " + (TotalNumber <= CurrentPage * pageSize ? "disabled" : "") + "\"><a class=\"page-link\" onclick=\"mrg.GetOthersData('" + (TotalNumber % pageSize > 0 ? parseInt((TotalNumber / pageSize).toString()) + 1 : parseInt((TotalNumber / pageSize).toString())) + "')\">&raquo;</a></li>\n                    <li class=\"page-item\"><span class=\"text-muted total-page-number\" style=\"display:block;position:relative;padding:0.5rem 0.75rem\">\u5171" + (TotalNumber % pageSize > 0 ? parseInt((TotalNumber / pageSize).toString()) + 1 : parseInt((TotalNumber / pageSize).toString())) + "\u9875" + TotalNumber + "\u6761\u6570\u636E</span></li>";
                $("#OtherPagination").append(page_raw);
                $(".others-goto-page").bind("keypress", function (event) {
                    if (event.keyCode == 13) {
                        GetOthersData($(this).val());
                    }
                });
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求出错");
            }
        });
    }
    mrg.GetOthersData = GetOthersData;
})(mrg || (mrg = {}));
//# sourceMappingURL=mrg.js.map