interface Table {
    RoleName: string,
    PageID: number,
    PageName : string,
}


interface Expansion {
    PageID:number,
    PageName:string,
    Approve:boolean,                                                                                                                                                                                                                                
    Reject:boolean,                                                                                             
    Edit:boolean,
    View:boolean,
    Delete:boolean,
    Add:boolean,
    Upload:boolean,
}


interface PermissionData {
    RoleName: string,
    UpdatedBy: string,
    UpdatedDate: string,
    Status:string,
//     approvedBy:string,
//     approvedDate:string,
//     rejectedBy:string,
//     rejectedDate:string,
}