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
            var TableName: string = $("[data-isTable]").attr("data-TableName").toString();
            location.href = `/Mrg/Index?tableName=${TableName}&pageNumber=${$(this).val()}`;
        }
    });
})

namespace mrg {

    export function AddItem() {
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
                    alert(res.message)
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("创建失败")
            }
        });
    }

    export function EditItem() {
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
        var ids: { [key: string]: string }[] = [];
        kindexs.forEach((value, index) => {
            ids.push({ [value.key]: checkeds.parent().siblings("th").eq(value.value)[0].innerText });
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
                    alert(res.message)
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("创建失败")
            }
        });
    }

    export function ShowAdd() {
        $('[data-isColumn]').val('');
        $("#Modal").find(".modal-title").text("新增")
        $("#Modal").modal("show");
        $(".edit-add-btn").attr("onclick", "mrg.AddItem()");
    }

    export function CheckAllChange(ele) {
        if (ele.checked) {
            $(".row-checkbox").prop('checked', true);
        }
        else {
            $(".row-checkbox").prop('checked', false);
        }
    }

    export function GetColumnValues() {
        var data: { [key: string]: string } = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
        var notnull_columns: string[] = [];
        $('[data-isColumn]').each(function () {
            var key: string = $(this).attr("data-DbColumnName").toString();
            var value: string = $(this).val().toString();
            data[key] = value;
            if ($(this).attr("required") && value.trim().length === 0) {
                notnull_columns.push(key);
            }
        })
        if (notnull_columns.length > 0) {
            alert(`以下为必填字段，请不要留空\r\n${notnull_columns.join("\r\n")}`);
        }
        return { ready: notnull_columns.length == 0, data: data };
    }

    export function ShowEdit() {
        var checkeds = $(".row-checkbox:checked");
        if (checkeds.length === 0) {
            return alert("请勾选你要编辑数据");
        }
        if (checkeds.length > 1) {
            return alert("每次只能编辑一行数据");
        }
        var data: { [key: string]: string } = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
        var kindexs = GetKeysAndIndexs();
        kindexs.forEach((value, index) => {
            data[value.key] = checkeds.parent().siblings("th").eq(value.value)[0].innerText
        })
        $("#Modal").find(".modal-title").text("编辑")
        $(".edit-add-btn").attr("onclick", "mrg.EditItem()");
        GetItemById(data);
    }

    export function GetItemById(data) {
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
                    let data = JSON.parse(res.data)[0]
                    $("[data-isColumn]").each(function () {
                        $(this).val(data[$(this).attr("data-DbColumnName").toString()]);
                    });
                    $("#Modal").modal("show");
                }
                else {
                    alert(res.message)
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("获取数据失败")
            }
        });
    }

    function GetKeysAndIndexs() {
        var indexs: { key: string, value: number }[] = [];
        $("#data_table>thead>tr").find('th[data-iskey]').each(function () {
            var keyname: string = $(this).attr("data-dbcolumnname").toString();
            indexs.push({ key: keyname, value: $(this).index() - 1 });
        });
        return indexs;
    }

    function GetCheckedIds() {
        var kindexs = GetKeysAndIndexs();
        var checkeds = $(".row-checkbox:checked");
        var many_ids: { [key: string]: string }[][] = [];
        checkeds.each(function () {
            var checked = $(this);
            var ids: { [key: string]: string }[] = [];
            kindexs.forEach(function (value, index) {
                ids.push({ [value.key]: checked.parent().siblings("th").eq(value.value)[0].innerText });
            })
            many_ids.push(ids);
        })
        return many_ids;
    }

    export function SetDefaultValue(ele) {
        var defaultvalue = $(ele).attr("data-DefaultValue").toString();
        $(ele).siblings("[data-isColumn]").val(defaultvalue);
    }

    export function IsSetStatusKeyWord(status) {
        var data: { [key: string]: string } = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
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
                        $('#StatusKeyWord').val('')
                        $('#KeyWordOn').val('')
                        $('#KeyWordOff').val('')
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
                alert("请求出错")
            }
        });
    }

    function EnableOrDisableItem(data) {
        var checkeds = $(".row-checkbox:checked");
        var text = data["Status"] === 1 ? "启用" : "禁用";
        if (checkeds.length === 0) {
            return alert(`请勾选你要${text}的数据`);
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
                alert("请求出错")
            }
        });
    }

    export function SetStatusKeyWord() {
        var data: { [key: string]: string } = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
        var StatusKeyWord: string = $('#StatusKeyWord').val().toString()
        var KeyWordOn: string = $('#KeyWordOn').val().toString()
        var KeyWordOff: string = $('#KeyWordOff').val().toString()
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
                alert("请求出错")
            }
        });

    }

    export function DeleteItems() {
        var checkeds = $(".row-checkbox:checked");
        if (checkeds.length === 0) {
            return alert(`请勾选你要删除的数据`);
        }
        var con = confirm("确定删除吗，一旦删除将无法找回！");
        if (!con) {
            return;
        }
        var data: { [key: string]: string } = { TableName: $("[data-isTable]").attr("data-TableName").toString() };
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
                alert("请求出错")
            }
        });
    }

    export function FromOthers(ele) {
        $("#DynamicModal").load('/Mrg/ModalView', function () {
            $("#DynamicModal").modal('show');
            GetColumnsByTableName();
            $("#TableNames").change(function () {
                GetColumnsByTableName();
            })
            $("#ChooseOtherData").unbind("click");
            $("#ChooseOtherData").click(function () {
                var column = $("#ColumnNames").val();
                var value = $(".otherdata-radio:checked").parent('th').siblings(`[data-dbcolumnname="${column}"]`).text()
                $(ele).siblings("[data-iscolumn]").val(value)
                $("#DynamicModal").modal('hide');
            });
        });
    }

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
                var columns = res as Array<object>;
                if (columns.length > 0) {
                    var columnsOPtions = columns.map((value, index) => {
                        var IsPrimarykey = value["IsPrimarykey"] as boolean;
                        var selected = IsPrimarykey ? "selected" : "";
                        return `<option value="${value["DbColumnName"]}" ${selected}>${value["DbColumnName"]}</option>`;
                    })
                    $("#ColumnNames").children('option').length > 0 && $("#ColumnNames").empty();
                    $("#ColumnNames").append(columnsOPtions.join(''));
                    GetOthersData(1);
                }
                else {
                    alert("找不到相关的任何字段！")
                }
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求出错")
            }
        });
    }

    export function GetOthersData(pageNumber) {
        var TableName: string = $("#TableNames").val().toString();
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
                $("#OtherThead>tr").children().length > 0 && $("#OtherThead>tr").empty()
                $("#OtherTbody").children().length > 0 && $("#OtherTbody").empty()
                $("#OtherPagination").children().length > 0 && $("#OtherPagination").empty()
                var columns: string[] = res.columns;
                var columns_th: string[] = columns.map(value => {
                    var DbColumnName = value["ColumnDescription"] || value["DbColumnName"];
                    return `<th>${DbColumnName}</th>`;
                })
                var columns_raw = `<th></th>${columns_th.join("")}`
                $("#OtherThead>tr").append(columns_raw);
                if (res.data) {
                    var data: object[] = JSON.parse(res.data);
                    if (data.length > 0) {
                        var rows_th: string[] = data.map(row => {
                            var row_th: string[] = columns.map(col => {
                                return `<th data-DbColumnName="${col["DbColumnName"]}">${row[col["DbColumnName"]]}</th>`;
                            })
                            var row_raw = `<tr><th scope="row"><input name="otherdata" class="custom-radio otherdata-radio" type="radio"/></th>${row_th.join("")}</tr>`;
                            return row_raw;
                        });
                        $("#OtherTbody").append(rows_th.join(""));
                    }
                    else {
                        $("#OtherTbody").append('<center style="color:gray">没有任何数据</center>')
                    }
                }
                var CurrentPage: number = Number(res.CurrentPage);
                var TotalNumber: number = Number(res.TotalNumber);
                var pageSize: number = 15;
                var previou_raw = '';
                var next_raw = '';
                for (var i = 5; i >= 1; i--) {
                    var previou_page: number = CurrentPage - i;
                    if (previou_page > 0) {
                        previou_raw += `<li class="page-item" title="第${previou_page}页"><a class="page-link" onclick="mrg.GetOthersData('${previou_page}')">${previou_page}</a></li>`;
                    }
                }
                for (var i = 1; i <= 5; i++) {
                    var next_page: number = CurrentPage + i;
                    if (next_page * pageSize - TotalNumber < 15) {
                        next_raw += `<li class="page-item" title="第${next_page}页"><a class="page-link" onclick="mrg.GetOthersData('${next_page}')">${next_page}</a></li>`;
                    }
                }
                var page_raw = `
                    <li class="page-item" style="width:35%"><input style="width:100%" class="page-link text-muted others-goto-page" type="number" placeholder="页码" value="${CurrentPage}" /></li>
                    <li class="page-item ${(CurrentPage == 1 ? "disabled" : "")}" title="首页"><a class="page-link" onclick="mrg.GetOthersData('1')">&laquo;</a></li>
                    <li class="page-item ${(CurrentPage == 1 ? "disabled" : "")}" title="上一页"><a class="page-link" onclick="mrg.GetOthersData('${(CurrentPage > 1 ? CurrentPage - 1 : 1)}')">&lsaquo;</a></li>
                     ${previou_raw}
                    <li class="page-item active" title="当前页"><a class="page-link">${CurrentPage}</a></li>
                    ${next_raw}
                    <li title="下一页" class="page-item ${(TotalNumber <= CurrentPage * pageSize ? "disabled" : "")}"><a class="page-link" onclick="mrg.GetOthersData('${CurrentPage + 1}')">&rsaquo;</a></li>
                    <li title="最后一页" class="page-item ${(TotalNumber <= CurrentPage * pageSize ? "disabled" : "")}"><a class="page-link" onclick="mrg.GetOthersData('${(TotalNumber % pageSize > 0 ? parseInt((TotalNumber / pageSize).toString()) + 1 : parseInt((TotalNumber / pageSize).toString()))}')">&raquo;</a></li>
                    <li class="page-item"><span class="text-muted total-page-number" style="display:block;position:relative;padding:0.5rem 0.75rem">共${(TotalNumber % pageSize > 0 ? parseInt((TotalNumber / pageSize).toString()) + 1 : parseInt((TotalNumber / pageSize).toString()))}页${TotalNumber}条数据</span></li>`;
                $("#OtherPagination").append(page_raw);
                $(".others-goto-page").bind("keypress", function (event) {
                    if (event.keyCode == 13) {
                        GetOthersData($(this).val());
                    }
                });
            },
            //请求失败，包含具体的错误信息
            error: function (e) {
                alert("请求出错")
            }
        });
    }
}