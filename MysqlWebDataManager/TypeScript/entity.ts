$(document).ready(function () {
    $(".goto-page").bind("keypress", function (event) {
        if (event.keyCode == 13) {
            location.href = `/Entity/Index?pageNumber=${$(this).val()}`;
        }
    });
})

namespace entity {
    export function addSingleEntity() {
        $.ajax({
            //请求方式
            type: "POST",
            //请求的媒体类型
            //请求地址
            url: '/Entity/AddSingleEntity',
            data: { tableName: $("#tableName").val(), active: $("#active").val() },
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

    export function CheckAllChange(ele) {
        if (ele.checked) {
            $(".row-checkbox").prop('checked', true);
        }
        else {
            $(".row-checkbox").prop('checked', false);
        }
    }

    export function GetCheckedRowsValues() {
        var keyIndex = $("thead>tr").find('th[data-iskey]').index()
        var keyName: string = $("thead>tr").find('th[data-iskey]').attr("data-DbColumnName").toString();
        var values: string[] = [];
        $(".row-checkbox:checked").parents('tr').each(function () {
            var keyValue: string = $(this).children('th').eq(keyIndex)[0].innerText.toString();
            values.push(keyValue)
        })
        return {
            tableName: "TableInfo",
            where: { [keyName]: values }
        };
    }

    export function DisableEntities() {
        $.ajax({
            type: "POST",
            url: '/Entity/DisableEntities',
            data: { data: JSON.stringify(GetCheckedRowsValues()) },
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
                alert("禁用过程中发生出错！")
            }
        });
    }

    export function EnableEntities() {
        $.ajax({
            type: "POST",
            url: '/Entity/EnableEntities',
            data: { data: JSON.stringify(GetCheckedRowsValues()) },
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
                alert("启用过程中发生出错！")
            }
        });
    }

    export function DeleteEntities() {
        $.ajax({
            type: "POST",
            url: '/Entity/DeleteEntities',
            data: { data: JSON.stringify(GetCheckedRowsValues()) },
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
                alert("删除过程中发生出错！")
            }
        });
    }
}