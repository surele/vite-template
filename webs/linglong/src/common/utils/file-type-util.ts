/**
 * 文件类型工具类
 */
export class FileTypeUtil {
    
    public static isExcelFile(type: string = "") {
        return (
            type === "application/vnd.ms-excel" ||
            type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            type === "application/eio-x-xls" ||
            type === "application/eio-x-xlsx"
        );
    }
}
