import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'api.service';
import { ManualToasterErrorComponent } from 'app/components/manual-toaster-error/manual-toaster-error.component';
import { ManualToasterComponent } from 'app/components/manual-toaster/manual-toaster.component';
import { Router } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-user-dj-list',
  templateUrl: './user-dj-list.component.html',
  styleUrls: ['./user-dj-list.component.scss']
})
export class UserDJListComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name', 'email', 'mobileNo', 'status', 'action'];
  dataSource = new MatTableDataSource<PeriodicElement>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('toaster') toaster!: ManualToasterComponent;
  @ViewChild('toastererror') toastererror!: ManualToasterErrorComponent;
  @ViewChild('myModal', { static: false }) myModal!: ElementRef;

  userList: Array<any> = []
  isLoading: boolean = false
  username: any;
  useremali: any;
  usermobile: string = '';
  usernameValidate: boolean = false;
  useremaliValidate: boolean = false;
  usermobileValidate: boolean = false;
  value: any;
  userId: any;
  message: any;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private apiService: ApiService, private router: Router, private location: Location) { }

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.isLoading = true
    this.apiService.get('getUser').subscribe((response: any) => {

      if (response.status == 'sucess') {
        for (let i = 0; i < response.message.length; i++) {
          var array = {
            position: i + 1,
            // lastName
            userid: response.message[i].userid,
            name: response.message[i].firstName,
            email: response.message[i].emailId,
            mobileNo: response.message[i].mobileNumber,
            isActive: response.message[i].isActive,
            userstatus: response.message[i].isActive == true ? 'Active' : 'In-Active',
          }

          this.userList.push(array)
        }

      }
      this.dataSource = new MatTableDataSource<PeriodicElement>(this.userList)
      this.dataSource.paginator = this.paginator;
      this.isLoading = false

    });
  }
  edit(id: any) {
    this.usernameValidate = false;
    this.useremaliValidate = false;
    this.usermobileValidate = false;
    let userlistFilter: Array<any>
    userlistFilter = this.userList.filter((e) => e.userid == id)
    this.username = userlistFilter[0].name;
    this.useremali = userlistFilter[0].email;
    this.usermobile = userlistFilter[0].mobileNo;
    this.userId = userlistFilter[0].userid;
    console.log(userlistFilter)
  }
  updateUser() {
    this.usernameValidate = false;
    this.useremaliValidate = false;
    this.usermobileValidate = false;
    if(this.username == ''){
      //this.showToasterError('Please enter Username.')
      this.usernameValidate = true;
    }else if(this.useremali == ''){
      //this.showToasterError('Please enter Useremail')
      this.useremaliValidate = true;
    }else if(this.usermobile  == ''){
      //this.showToasterError('Please enter MobileNo')
      this.usermobileValidate = true;
    }else{
      this.usernameValidate = false;
      this.useremaliValidate = false;
      this.usermobileValidate = false;
      this.isLoading = true
      this.closeModal();
      let param = {
        name: this.username,
        email: this.useremali,
        mobileNo: this.usermobile,
        userid: this.userId
      }
      this.apiService.post('updateUser', param).subscribe((response: any) => {
        console.log(response.status)
        if (response.status != 'error') {
          this.isLoading = false
          this.showToaster('Update successfully !')
          setTimeout(() => {
            this.reloadWindow()
            //this.router.navigate(['settings']);
          }, 2000);
        } else {
          this.isLoading = false
          this.showToasterError(response.message)
        }
  
      });
    }
  }
  deleteUser(id: any) {
    this.isLoading = true
    let param = {
      userid: id
    }
    this.apiService.post('deleteUser', param).subscribe((response: any) => {
      console.log(response.status)
      if (response.status != 'error') {
        this.isLoading = false
        this.showToaster('Deleted successfully !')
        setTimeout(() => {
          this.reloadWindow()
          //this.router.navigate(['settings']);
        }, 2000);
      } else {
        this.isLoading = false
        this.showToasterError(response.message)
      }

    });

  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  lockUser(id: any) {
    this.isLoading = true
    var param = {
      userid: id,
      isActive: false
    }
    this.apiService.post('lockUser', param).subscribe((response: any) => {
      console.log(response.status)
      if (response.status != 'error') {
        this.isLoading = false
        this.showToaster('User Locked successfully !')
        setTimeout(() => {
          this.reloadWindow()
          //this.router.navigate(['settings']);
        }, 1000);
      } else {
        this.isLoading = false
        this.showToasterError(response.message)
      }

    });

  }
  unlockUser(id: any) {
    this.isLoading = true
    var param = {
      userid: id,
      isActive: true
    }
    this.apiService.post('unlockUser', param).subscribe((response: any) => {
      console.log(response.status)
      if (response.status != 'error') {
        this.isLoading = false
        this.showToaster('User Unlocked successfully !')
        setTimeout(() => {
          this.reloadWindow()
          //this.router.navigate(['settings']);
        }, 1000);
      } else {
        this.isLoading = false
        this.showToasterError(response.message)
      }

    });

    
  }
  closeModal() {
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      const modalBackdrop = document.querySelector('.modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.remove();
      }
      document.body.classList.remove('modal-open');
    }
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  showToaster(message: any) {
    this.message = message
    this.toaster.showToaster()
  }
  showToasterError(message: any) {
    this.message = message
    this.toastererror.showToaster()
  }
  reloadWindow() {
    window.location.reload();
  }
  ExportTOExcel()
  {
    // Create a new MatTableDataSource with all the data
    const fullDataSource = new MatTableDataSource(this.userList);

    // Set the paginator for the full data source
    fullDataSource.paginator = this.paginator;

    // Create a DatePipe instance
  const datePipe = new DatePipe('en-US');

    // Convert the data to an array of arrays
     const data = fullDataSource.data.map((item) => {
    return [
      item.position,
      item.name,
      item.email,
      item.mobileNo,
      item.userstatus
    ];
  });

    // Create a worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([['No.', 'User Name', 'Email', 'Mobile Number', 'Status'], ...data]);

    // Create a workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Save the Excel file
    XLSX.writeFile(wb, 'User-List Excel.xlsx');
    
  }
}
export interface PeriodicElement {
  position: number;
  userid: number
  name: string;
  email: string;
  mobileNo: string;
  userstatus: string;
}

