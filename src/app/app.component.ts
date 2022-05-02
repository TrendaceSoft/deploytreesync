import {
  Component,
  OnInit,
  ViewChild,
  HostListener
} from '@angular/core';
import { createCheckBox } from '@syncfusion/ej2-buttons';
import {
  TreeGridComponent,
  SelectionSettingsModel,
  EditSettingsModel,
  EditService,
  ColumnChooserService,
  ToolbarService,
  SortService,
  FreezeService,
  FilterService,
  VirtualScrollService,
} from '@syncfusion/ej2-angular-treegrid';
import {
  MenuEventArgs,
  MenuItemModel
} from '@syncfusion/ej2-navigations';
import {
  closest,
  createElement
} from '@syncfusion/ej2-base';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ItemModel } from '@syncfusion/ej2-angular-splitbuttons';
import { ContextMenuComponent } from '@syncfusion/ej2-angular-navigations';
import { HttpService } from './services/http.service';
import { forkJoin } from 'rxjs';
import { FormBuilder, Validators, FormArray, AbstractControl, FormGroup } from '@angular/forms';

import { DataManager, Query } from '@syncfusion/ej2-data';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [EditService, ColumnChooserService, ToolbarService, SortService, FreezeService, VirtualScrollService]
})

export class AppComponent implements OnInit {

  @ViewChild('treegrid')
  treegrid!: TreeGridComponent;
  selectionOptions: SelectionSettingsModel = { type: 'Single', mode: 'Row' };
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    allowEditOnDblClick: true,
    mode: 'Row'
  };

  @ViewChild('contextmenu')
  cmenu!: ContextMenuComponent;



  menuItems: MenuItemModel[] = [
    { text: 'EditCol', id: 'editCol' },
    { text: 'NewCol', id: 'newCol' },
    { text: 'DelCol', id: 'deleteCol' },
    { text: 'ChooseCol', id: 'columnChooser' },
    { text: 'FreezeCol', id: 'freeze' },
    { text: 'FilterCol', id: 'filter' },
    { text: 'Multisort', id: 'multisort' },
    { text: 'Reorder', id: 'dragdrop' },

    { text: 'AddNext', id: 'addrownext' },
    { text: 'Add child', id: 'addchildnext' },
    { text: 'DelRow', id: 'deleterow' },
    { text: 'EditRow', id: 'editrow' },
    { text: 'MultiSelect', id: 'multiselect' },
    { text: 'CopyRows', id: 'copyrow' },
    { text: 'CutRows', id: 'cutrow' },
    { text: 'PasteNext', id: 'pastenext' },
    { text: 'PasteChild', id: 'pastechild' },
  ];

  columnIndex: number = 0;
  columnName: string = '';
  columnHeaderName: any = '';
  x: any;
  y: any;
  rowIndex: number = 0;

  @ViewChild('dialog')  //editCol Dialog
  alertDialog!: DialogComponent;
  visible: boolean = false;
  alertDlgButtons: object[] = [
    {
      buttonModel: {
        isPrimary: true,
        content: 'Save',
        cssClass: 'e-flat'
      },
      click: () => {
        this.changeColumnProperties();
      }
    }, {
      buttonModel: {

        content: 'Cancel',
        cssClass: 'e-flat',
      },
      click: () => {
        this.alertDialog.hide();
      }
    }
  ];


  @ViewChild('dialog2') //addCol Dialog
  alertDialog2!: DialogComponent;
  visible2: boolean = false;
  alertDlgButtons2: object[] = [];


  @ViewChild('dialog3') //delCol Dialog
  alertDialog3!: DialogComponent;
  visible3: boolean = false;
  alertDlgButtons3: object[] = [
    {
      buttonModel: {
        isPrimary: true,
        content: 'Okay',
        cssClass: 'e-flat',
      },
      click: () => {
        this.deleteColumn();
        this.alertDialog3.hide();
      }
    }, {
      buttonModel: {
        content: 'Cancel',
        cssClass: 'e-flat',
      },
      click: () => {
        this.alertDialog3.hide()
      }
    }
  ];

  @ViewChild('dialog4') //delRow Dialog
  alertDialog4!: DialogComponent;
  visible4: boolean = false;
  alertDlgButtons4: object[] = [
    {
      buttonModel: {
        isPrimary: true,
        content: 'Okay',
        cssClass: 'e-flat',
      },
      click: () => {
        this.deleteRow();
      }
    }, {
      buttonModel: {
        content: 'Cancel',
        cssClass: 'e-flat',
      },
      click: () => {
        this.alertDialog4.hide()
      }
    }
  ];

  public animationSettings: Object = { effect: 'Zoom', duration: 400, delay: 0 };

  indexOfCopiedRow: any = [];
  indexOfCuttedRow: any = 0;
  copyFlag: boolean = false;
  cutFlag: boolean = false;

  fontColor: ItemModel[] = [{ text: 'Black', id: 'fontColor' }, { text: 'MidnightBlue', id: 'fontColor' }, { text: 'Sienna', id: 'fontColor' }];
  backgroundColor: ItemModel[] = [{ text: 'White', id: 'bgColor' }, { text: 'PowderBlue', id: 'bgColor' }, { text: 'BlanchedAlmond', id: 'bgColor' }];
  alignment: ItemModel[] = [{ text: 'Right', id: 'align' }, { text: 'Left', id: 'align' }, { text: 'Center', id: 'align' }];
  fontSize: ItemModel[] = [{ text: '13', id: 'fontSize' }, { text: '14', id: 'fontSize' }, { text: '16', id: 'fontSize' }, { text: '18', id: 'fontSize' }];
  minColWidth: ItemModel[] = [{ text: '100', id: 'minColWidth' }, { text: '150', id: 'minColWidth' }];

  dataType: ItemModel[] = [
    { text: 'Text', id: 'dataType' },
    { text: 'Number', id: 'dataType' },
    { text: 'Date', id: 'dataType' },
    { text: 'Boolean', id: 'dataType' },
    { text: 'DropDownList', id: 'dataType' },
  ];
  isChecked: boolean = false;

  gridData: any;
  maxId: any;
  maximumId: number = 0;
  headerName: any;
  isHeader: boolean = false;
  apiColmnData: any;
  headerObject: any;

  screenWidth: any;
  screenHeight: any;
  colDataType: any;
  colFontSize: any;
  colFontColor: any;
  colbgColor: any;
  colAlignment: any;
  colMinWidth: any;
  colDefaultVal: any;

  updateData: any = {};
  jsonObj: any = {};
  gridProperty: any;

  width: any;

  editColumnForm: any = {
    autoFit: false,
    backgroundColor: "",
    editType: "",
    field: "",
    fontColor: "",
    fontSize: "",
    headerText: "",
    minWidth: "",
    textAlign: "",
    type: "",
    format: "",
    defaultValue: ""
  };

  isColumnName: boolean = false;
  list: any;

  isFromValid: boolean = false;
  isError: boolean = false;

  headerTextCollection: string[] = [];
  columnTitle: any;
  isOtherColumnName: boolean = false;
  isNewColNameRepeat: boolean = false;
  cutRecord: any;
  copiedRecord: any;
  dummyId: number = 0;
  rowToDelete: any;


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenHeight = (this.treegrid.allowFiltering) ? ((window.innerHeight - (window.outerHeight - window.innerHeight)) - 35) : (window.innerHeight - (window.outerHeight - window.innerHeight));
  }

  constructor(public apiCall: HttpService, private formBuilder: FormBuilder) {

  }

  get colName() {
    return this.newColForm.controls["colName"] as any;
  }
  get columnDataType() {
    return this.newColForm.controls["columnDataType"] as any;
  }
  get defaultValue() {
    return this.newColForm.controls["defaultValue"] as any;
  }
  get columnMinWidth() {
    return this.newColForm.controls["columnMinWidth"] as any;
  }
  get columnFontSize() {
    return this.newColForm.controls["columnFontSize"] as any;
  }
  get columnFontColor() {
    return this.newColForm.controls["columnFontColor"] as any;
  }
  get columnBgColor() {
    return this.newColForm.controls["columnBgColor"] as any;
  }
  get columnAlignment() {
    return this.newColForm.controls["columnAlignment"] as any;
  }
  get columnTextWrap() {
    return this.newColForm.controls["columnTextWrap"] as any;
  }
  get listItem() {
    return this.newColForm.controls["listItem"] as any;
  }
  newColForm = this.formBuilder.group({
    colName: ['', [Validators.required]],
    columnDataType: ['', [Validators.required]],
    defaultValue: ['', [Validators.required]],

    columnMinWidth: ['', [Validators.required]],
    columnFontSize: ['', [Validators.required]],
    columnFontColor: ['', [Validators.required]],
    columnBgColor: ['', [Validators.required]],
    columnAlignment: ['', [Validators.required]],
    columnTextWrap: [true],

    listItem: this.formBuilder.array([])
  });



  ngAfterViewInit(): void {
    document.onclick = (args: any) => {
      if (args.target.className === 'e-dlg-overlay') {
        // this.alertDialog3.hide();
        // this.alertDialog2.hide();
      }
    }
  }

  updateRowData() {
    this.apiCall.list().subscribe((gridData: any) => {
      this.gridData = gridData;
      hideSpinner(<any>document.getElementById('container'));
    })
  }

  ngOnInit() {


    this.newColForm.valueChanges.subscribe(form => {
      if (
        form.colName != "" && form.colName != null &&
        form.columnAlignment != "" && form.columnAlignment != null &&
        form.columnBgColor != "" && form.columnBgColor != null &&
        form.columnFontColor != "" && form.columnFontColor != null &&
        form.columnFontSize != "" && form.columnFontSize != null &&
        form.columnMinWidth != "" && form.columnMinWidth != null &&
        form.columnDataType != "" && form.columnDataType != null) {
        if (form.columnDataType == "DropDownList") {
          if (form.listItem.length == 0) {
            this.isFromValid = false;
          } else {
            for (var i = 0; i < form.listItem.length; i++) {
              if (form.listItem[i]['item'] == null || form.listItem[i]['item'] == "") {
                this.isFromValid = false;
                return;
              } else {
                this.isFromValid = true;
              }
            }
          }
        } else if (form.columnDataType == "Boolean") {
          if (typeof form.defaultValue == 'boolean') {
            this.isFromValid = true;
          } else {
            this.isFromValid = false;
          }
        } else {
          if (form.defaultValue != "" && form.defaultValue != null) {
            this.isFromValid = true;
          } else {
            this.isFromValid = false;
          }
        }

      } else {
        this.isFromValid = false;
      }
    });

    this.screenHeight = (window.innerHeight - (window.outerHeight - window.innerHeight));

    // read header
    forkJoin([this.apiCall.getGridProperty(), this.apiCall.listHeader(), this.apiCall.list()]).subscribe(([gridProperty, headerData, gridData]) => {
      this.gridProperty = gridProperty;
      this.headerName = headerData;
      this.gridData = gridData;
      this.isHeader = true;

      setTimeout(() => {
        new Promise<void>((resolve, reject) => {
          if (this.gridProperty != '' && this.headerName != '' && this.gridData != '') {
            resolve();
          } else {
            reject();
          }
        }).then(() => {
          // console.log('resolve1')
          this.treegrid.allowSorting = this.gridProperty.allowSorting;
          this.treegrid.allowRowDragAndDrop = this.gridProperty.allowRowDragAndDrop;
        }).then(() => {
          // console.log('resolve2');
          if (this.gridProperty.allowFiltering) {
            this.treegrid.allowFiltering = this.gridProperty.allowFiltering;
            this.treegrid.filterSettings.hierarchyMode = "Parent";
            this.screenHeight = (window.innerHeight - (window.outerHeight - window.innerHeight)) - 35;
          }
          if (!this.gridProperty.allowFiltering) {
            this.treegrid.allowFiltering = this.gridProperty.allowFiltering;
            this.screenHeight = (window.innerHeight - (window.outerHeight - window.innerHeight));
          }
        }).then(() => {
          // console.log('resolve3');
          if (this.gridProperty["multiselect"]) {
            this.treegrid.selectionSettings.type = 'Multiple';
            this.treegrid.selectionSettings.mode = 'Row';
          }
          if (!this.gridProperty["multiselect"]) {
            this.treegrid.selectionSettings.type = 'Single';
            this.treegrid.selectionSettings.mode = 'Row';
          }
        }).then(() => {
          // console.log('resolve4');
          if (this.gridProperty["frozenColumns"] == 0) {
            this.treegrid.frozenColumns = 0;
            this.treegrid.enableInfiniteScrolling = false;
            this.treegrid.enableVirtualization = true;
            (<any>document.querySelector('#contextmenu')).ej2_instances[0].target = '.e-grid';
            this.treegrid.refreshColumns();
          }
          if (this.gridProperty["frozenColumns"] != 0) {
            // console.log(this.gridProperty["frozenColumns"]);
            setTimeout(() => { }, 20000)
            setTimeout(() => {
              this.treegrid.refreshColumns();
              this.treegrid.enableVirtualization = false;
              this.treegrid.frozenColumns = this.gridProperty["frozenColumns"];
              this.treegrid.enableInfiniteScrolling = true;
              (<any>document.querySelector('#contextmenu')).ej2_instances[0].target = '.e-grid';
            }, 200)
          }
        }).then(() => {
          setTimeout(() => {
            hideSpinner(<any>document.getElementById('container'));
          }, 1000)

        }).catch(() => {
          // console.log('reject')
        });
      }, 800)
    }, (err => {
      // console.log(err)
    }
    ));

  }

  dataBound(args: any) {
    this.treegrid.grid.keyboardModule.keyConfigs['delete'] = '';
  }

  CustomizeCell(args: any) {
    for (var i = 0; i < this.headerName.length; i++) {
      if (args.column.field == this.headerName[i].field) {
        args.cell.setAttribute('style', 'background-color:' + this.headerName[i]['backgroundColor'] + ';color:' + this.headerName[i]['fontColor'] + ';font-size:' + this.headerName[i]['fontSize'] + ';text-align:' + this.headerName[i]['textAlign'] + ';');
      }
      if (args.column.type === "boolean") {
        args.column.displayAsCheckBox = true;
      }


      if (args.column.editType == "dropdownedit") {
        let listItems = args.column.defaultValue;
        let field = args.column.field;
        let celldata = args.data[field];

        let elem: any;
        let instanceObj: any;
        (args.column as any).edit = {
          create: () => {
            elem = document.createElement('input');
            return elem;
          },
          read: () => {
            return instanceObj.text;
          },
          destroy: () => {
            instanceObj.destroy();
          },
          write: () => {
            instanceObj = new DropDownList({
              // dataSource: new DataManager(listItems),
              dataSource: listItems,
              fields: { value: 'item', text: 'item' },
              value: celldata
            });
            instanceObj.appendTo(elem);
          },
        };


      }

    }

  }

  ContextMenuItemRender(args: MenuEventArgs) {
    const switchValues: any = {
      "FreezeCol": this.gridProperty.frozenColumns,
      "FilterCol": this.gridProperty.allowFiltering,
      "Multisort": this.gridProperty.allowSorting,
      "Reorder": this.gridProperty.allowRowDragAndDrop,
      "MultiSelect": this.gridProperty.multiselect,
    }
    let checkboxMenu: string[] = ["FreezeCol", "FilterCol", "Multisort", "Reorder", "MultiSelect"]
    if (checkboxMenu.indexOf(args.item.text!) != -1) {
      // console.log(args.item.text)
      if (args.item.text == "FreezeCol") {
        let check: Element = createCheckBox(createElement, false, {
          // label: args.item.text,
          // checked: false
          label: args.item.text,
          checked: (switchValues[args.item.text as any] == 0) ? false : true
        });
        args.element.innerHTML = '';
        args.element.appendChild(check);
      } else {
        let check: Element = createCheckBox(createElement, false, {
          // label: args.item.text,
          // checked: false
          label: args.item.text,
          checked: switchValues[args.item.text as any]
        });
        args.element.innerHTML = '';
        args.element.appendChild(check);
      }

    }
  }

  ContextMenuBeforeOpen(arg: any) {

    this.x = arg.event.x;
    this.y = arg.event.y;

    if ((arg.event.target as HTMLElement).closest('th')) {
      this.cmenu.showItems(['NewCol', 'DelCol', 'EditCol', 'ChooseCol', 'FreezeCol', 'FilterCol', 'Multisort', 'Reorder']);
      this.cmenu.hideItems(['AddNext', 'Add child', 'DelRow', 'EditRow', 'MultiSelect', 'CopyRows', 'CutRows', 'PasteNext', 'PasteChild',]);
    }
    else {
      this.cmenu.hideItems(['NewCol', 'DelCol', 'EditCol', 'ChooseCol', 'FreezeCol', 'FilterCol', 'Multisort', 'Reorder']);
      this.cmenu.showItems(['AddNext', 'Add child', 'DelRow', 'EditRow', 'MultiSelect', 'CopyRows', 'CutRows', 'PasteNext', 'PasteChild',]);
    }

    if (arg.event.target.closest('.e-headercell') != null) {
      this.columnHeaderName = (arg.event.target as any).innerText;

      /**
       * arg.event.target.closest('.e-headercell').ariaColIndex this way not working in firefox
       * arg.event.target.closest('.e-headercell').getAttribute("aria-colindex") this works in both chrome and firefox
       */
      // this.columnIndex = parseInt(arg.event.target.closest('.e-headercell').ariaColIndex);

      this.columnIndex = parseInt(arg.event.target.closest('.e-headercell').getAttribute("aria-colindex"));

      this.columnName = this.treegrid.getColumns(true)[this.columnIndex].field;

      this.columnTitle = this.treegrid.getColumns(true)[this.columnIndex].headerText
    }

    if (arg.event.target.closest('.e-row') != null) {
      // this.rowIndex = parseInt(arg.event.target.closest('.e-row').ariaRowIndex);

      this.rowIndex = parseInt(arg.event.target.closest('.e-row').getAttribute("aria-rowindex"));
    }

    this.apiCall.listHeader().subscribe((res) => {
      this.headerObject = res;
      // // console.log(this.headerObject)
    });

  }

  ContextMenuClick(args: MenuEventArgs) {

    const newColumnAlert = () => {
      this.newColForm.reset();
      this.headerObject.forEach((ele: any) => {
        let trimmedValue = ele.headerText.replace(/\s+/g, '');
        this.headerTextCollection.push(trimmedValue)
      });
      this.alertDialog2.show();
    }

    const deleteColumnAlert = () => {
      if (this.columnName != 'taskID') {
        this.alertDialog3.show();
      }

    }

    const editColumn = () => {
      // console.log(this.headerObject[this.columnIndex])
      //if column autoFit is true checkbox will be checked else unchecked
      let autoFit = (this.treegrid.getColumnByField(this.columnName) as any).autoFit;
      this.isChecked = (autoFit) ? true : false;

      var dataTypeKey = (this.headerObject[this.columnIndex]["type"] as any);
      var fontSizeKey = (this.headerObject[this.columnIndex]["fontSize"] as any);
      var fontColorKey = (this.headerObject[this.columnIndex]["fontColor"] as any);
      var bgColorKey = (this.headerObject[this.columnIndex]["backgroundColor"] as any);
      var alignmentKey = (this.headerObject[this.columnIndex]["textAlign"] as any);
      var minWidthKey = (this.headerObject[this.columnIndex]["minWidth"] as any);

      const dataTypeLabelName: any = {
        'string': "Text",
        'number': "Number",
        'date': "Date",
        'boolean': "Boolean",
        'none': "DropDownList"
      }
      const fontSizeLabelName: any = {
        '13px': '13',
        '14px': '14',
        '16px': '16',
        '18px': '18',
      }
      const fontColorLabelName: any = {
        'Black': "Black",
        'MidnightBlue': "MidnightBlue",
        'Sienna': "Sienna"
      }
      const bgColorLabelName: any = {
        '': "White",
        'PowderBlue': "PowderBlue",
        'BlanchedAlmond': "BlanchedAlmond"
      }
      const alignmentLabelName: any = {
        'Left': "Left",
        'Right': "Right",
        'Center': "Center"
      }

      const colMinWidthLabelName: any = {
        '100': "100",
        '150': "150"
      }

      this.colDataType = dataTypeLabelName[dataTypeKey];
      this.colFontSize = fontSizeLabelName[fontSizeKey];
      this.colFontColor = fontColorLabelName[fontColorKey];
      this.colbgColor = bgColorLabelName[bgColorKey];
      this.colAlignment = alignmentLabelName[alignmentKey];
      this.colMinWidth = colMinWidthLabelName[minWidthKey];
      this.colDefaultVal = (this.headerObject[this.columnIndex]["defaultValue"] as any);

      this.editColumnForm = {
        autoFit: this.headerObject[this.columnIndex]['autoFit'],
        backgroundColor: this.headerObject[this.columnIndex]['backgroundColor'],
        editType: this.headerObject[this.columnIndex]['editType'],
        field: this.headerObject[this.columnIndex]['field'],
        fontColor: this.headerObject[this.columnIndex]['fontColor'],
        fontSize: this.headerObject[this.columnIndex]['fontSize'],
        headerText: this.headerObject[this.columnIndex]['headerText'],

        minWidth: this.headerObject[this.columnIndex]['minWidth'],
        textAlign: this.headerObject[this.columnIndex]['textAlign'],
        type: this.headerObject[this.columnIndex]['type'],
        format: this.headerObject[this.columnIndex]['format'],
        defaultValue: this.headerObject[this.columnIndex]['defaultValue']

      }

      this.headerObject.forEach((ele: any) => {
        let trimmedValue = ele.headerText.replace(/\s+/g, '');
        this.headerTextCollection.push(trimmedValue)
      })

      setTimeout(() => {
        this.alertDialog.show();
      }, 300)

    }

    const columnChooser = () => {
      // this.treegrid.copy(true);
      // this.treegrid.columnChooserModule.openColumnChooser(this.x, this.y); // give X and Y axis
      this.treegrid.columnChooserModule.openColumnChooser(); // give X and Y axis
    }

    const filter = () => {
      if ((args.event?.target as Element).closest('.e-checkbox-wrapper')) {
        // args.cancel = true;
        let selectedElem: NodeList = args.element.querySelectorAll('.e-selected');
        for (let i: number = 0; i < selectedElem.length; i++) {
          let ele: Element = selectedElem[i] as Element;
          ele.classList.remove('e-selected');
        }
        let checkbox: HTMLElement = closest(args.event?.target as Element, '.e-checkbox-wrapper') as HTMLElement;
        let frame: HTMLElement = checkbox.querySelector('.e-frame')!;
        if (checkbox && frame.classList.contains('e-check')) {
          frame.classList.remove('e-check'); // do your actions when uncheck the checkbox
          this.treegrid.allowFiltering = false;
          for (var key in this.gridProperty) {
            if (key == "allowFiltering") {
              this.gridProperty.allowFiltering = false;
              this.screenHeight = (window.innerHeight - (window.outerHeight - window.innerHeight));
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                // console.log(res)
              });
            }
          };

        } else if (checkbox) {
          frame.classList.add('e-check');
          this.treegrid.allowFiltering = true; // do your actions when check the checkbox
          this.treegrid.filterSettings.hierarchyMode = "Parent";
          this.screenHeight = (window.innerHeight - (window.outerHeight - window.innerHeight)) - 35;

          for (var key in this.gridProperty) {
            if (key == "allowFiltering") {
              this.gridProperty.allowFiltering = true;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {

              });
            }
          };
        }
      }
    }

    const freezeColumn = () => {
      if ((args.event?.target as Element).closest('.e-checkbox-wrapper')) {
        // args.cancel = true;
        let selectedElem: NodeList = args.element.querySelectorAll('.e-selected');
        for (let i: number = 0; i < selectedElem.length; i++) {
          let ele: Element = selectedElem[i] as Element;
          ele.classList.remove('e-selected');
        }
        let checkbox: HTMLElement = closest(args.event?.target as Element, '.e-checkbox-wrapper') as HTMLElement;
        let frame: HTMLElement = checkbox.querySelector('.e-frame')!;

        if (checkbox && frame.classList.contains('e-check')) {

          frame.classList.remove('e-check');
          // this.treegrid.frozenColumns = 0;
          // this.treegrid.enableInfiniteScrolling = false;
          // this.treegrid.enableVirtualization = true;
          // (<any>document.querySelector('#contextmenu')).ej2_instances[0].target = '.e-grid';
          // this.treegrid.refreshColumns();

          for (var key in this.gridProperty) {
            // console.log(key);
            if (key == "frozenColumns") {
              this.gridProperty.frozenColumns = 0;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                if (res) {

                  location.reload();
                  // this.ngOnInit();

                }
              });
            }
          };

        } else if (checkbox) {


          frame.classList.add('e-check');
          // this.treegrid.enableVirtualization = false;
          // this.treegrid.frozenColumns = this.columnIndex + 1;
          // this.treegrid.enableInfiniteScrolling = true;
          // (<any>document.querySelector('#contextmenu')).ej2_instances[0].target = '.e-grid';
          // this.treegrid.refreshColumns();
          for (var key in this.gridProperty) {
            // console.log(key);
            if (key == "frozenColumns") {
              this.gridProperty.frozenColumns = this.columnIndex + 1;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                if (res) {

                  location.reload();
                  // this.ngOnInit();
                }
              });
            }
          };
        }

      }
    }

    const sortColumn = () => {
      if ((args.event?.target as Element).closest('.e-checkbox-wrapper')) {
        // args.cancel = true;
        let selectedElem: NodeList = args.element.querySelectorAll('.e-selected');
        for (let i: number = 0; i < selectedElem.length; i++) {
          let ele: Element = selectedElem[i] as Element;
          ele.classList.remove('e-selected');
        }
        let checkbox: HTMLElement = closest(args.event?.target as Element, '.e-checkbox-wrapper') as HTMLElement;
        let frame: HTMLElement = checkbox.querySelector('.e-frame')!;
        if (checkbox && frame.classList.contains('e-check')) {
          frame.classList.remove('e-check'); // do your actions when uncheck the checkbox
          this.treegrid.allowSorting = false

          for (var key in this.gridProperty) {
            // console.log(key);
            if (key == "allowSorting") {
              this.gridProperty.allowSorting = false;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                // // console.log(res)
              });
            }
          };

        } else if (checkbox) {
          frame.classList.add('e-check');
          this.treegrid.allowSorting = true;

          for (var key in this.gridProperty) {
            // console.log(key);
            if (key == "allowSorting") {
              this.gridProperty.allowSorting = true;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                // console.log(res)
              });
            }
          };

        }
      }
    }

    const dragDrop = () => {
      if ((args.event?.target as Element).closest('.e-checkbox-wrapper')) {
        // args.cancel = true;
        let selectedElem: NodeList = args.element.querySelectorAll('.e-selected');
        for (let i: number = 0; i < selectedElem.length; i++) {
          let ele: Element = selectedElem[i] as Element;
          ele.classList.remove('e-selected');
        }
        let checkbox: HTMLElement = closest(args.event?.target as Element, '.e-checkbox-wrapper') as HTMLElement;
        let frame: HTMLElement = checkbox.querySelector('.e-frame')!;
        if (checkbox && frame.classList.contains('e-check')) {
          frame.classList.remove('e-check'); // do your actions when uncheck the checkbox
          this.treegrid.allowRowDragAndDrop = false;

          for (var key in this.gridProperty) {
            if (key == "allowRowDragAndDrop") {
              this.gridProperty.allowRowDragAndDrop = false;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                // console.log(res)
              });
            }
          };


        } else if (checkbox) {
          frame.classList.add('e-check');
          this.treegrid.allowRowDragAndDrop = true;

          for (var key in this.gridProperty) {
            if (key == "allowRowDragAndDrop") {
              this.gridProperty.allowRowDragAndDrop = true;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                // console.log(res)
              });
            }
          };

        }
      }
    }

    const multiSelect = () => {
      if ((args.event?.target as Element).closest('.e-checkbox-wrapper')) {
        // args.cancel = true;
        let selectedElem: NodeList = args.element.querySelectorAll('.e-selected');
        for (let i: number = 0; i < selectedElem.length; i++) {
          let ele: Element = selectedElem[i] as Element;
          ele.classList.remove('e-selected');
        }
        let checkbox: HTMLElement = closest(args.event?.target as Element, '.e-checkbox-wrapper') as HTMLElement;
        let frame: HTMLElement = checkbox.querySelector('.e-frame')!;
        if (checkbox && frame.classList.contains('e-check')) {
          frame.classList.remove('e-check'); // do your actions when uncheck the checkbox
          this.treegrid.selectionSettings.type = 'Single';
          this.treegrid.selectionSettings.mode = 'Row';
          this.treegrid.clearSelection();

          for (var key in this.gridProperty) {
            // console.log(key);
            if (key == "multiselect") {
              this.gridProperty.multiselect = false;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                // console.log(res)
              });
            }
          };

        } else if (checkbox) {
          frame.classList.add('e-check');
          this.treegrid.selectionSettings.type = 'Multiple';
          this.treegrid.selectionSettings.mode = 'Row';

          for (var key in this.gridProperty) {
            // console.log(key);
            if (key == "multiselect") {
              this.gridProperty.multiselect = true;
              this.apiCall.updateGridProperty(this.gridProperty).subscribe((res) => {
                // console.log(res)
              });
            }
          };
        }
      }
    }

    const addchildnext = () => {
      this.treegrid.selectionSettings.persistSelection = true;
      this.treegrid.editSettings.newRowPosition = 'Child'
      // var id = this.treegrid.flatData.length + 1;
      var id = this.getMax() + 1;
      let jsonObj: any = {};
      this.treegrid.columns.forEach((res: any) => {
        jsonObj[res.field] = '';
      })
      jsonObj.id = id;
      jsonObj.taskID = id;
      this.treegrid.addRecord(jsonObj, this.rowIndex);
      setTimeout(() => {
        this.treegrid.selectionSettings.persistSelection = false;
      }, 200)
    }

    const addrownext = () => {
      this.treegrid.selectionSettings.persistSelection = true;
      this.treegrid.editSettings.newRowPosition = 'Below'
      // var id = this.treegrid.flatData.length + 1;
      var id = this.getMax() + 1;
      let jsonObj: any = {};
      this.treegrid.columns.forEach((res: any) => {
        jsonObj[res.field] = '';
      })
      jsonObj.id = id;
      jsonObj.taskID = id;
      this.treegrid.addRecord(jsonObj, this.rowIndex); // call addRecord method with data and index of parent record as parameters

      setTimeout(() => {
        this.treegrid.selectionSettings.persistSelection = false;
      }, 200)
    }

    const deleterow = () => {

      var selectedRecords = this.treegrid.getSelectedRecords() as any;
      var rowIndexes: any = [];

      // child loop to remove duplicates from selected records
      const filter = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          rowIndexes.push(data[i]['index']);
          selectedRecords.forEach((ele: any, index: any) => {
            if (ele.id == data[i]['id']) {
              selectedRecords.splice(index, 1);
            }
          })
          if (data[i].childRecords) {
            let childRecords = data[i].childRecords;
            filter(childRecords);
          }
        }
      }
      // parent loop 
      for (let i = 0; i < selectedRecords.length; i++) {
        rowIndexes.push(selectedRecords[i]['index']);
        if (selectedRecords[i].childRecords) {
          let childRecords = selectedRecords[i].childRecords;
          filter(childRecords);
        }
      }

      this.rowToDelete = selectedRecords;

      this.treegrid.selectRows(rowIndexes)

      this.alertDialog4.show();
    }

    const editrow = () => {
      this.treegrid.editSettings.mode = 'Dialog';
      setTimeout(() => {
        this.treegrid.selectRow(this.rowIndex); // select the row to be edit 
        this.treegrid.startEdit();
      }, 400)
    }

    const copyrow = () => {
      this.copyFlag = true;
      this.cutFlag = false;

      var selectedRecords = this.treegrid.getSelectedRecords() as any;
      var rowIndexes: any = [];

      // child loop to remove duplicates from selected records
      const filter = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          rowIndexes.push(data[i]['index']);
          selectedRecords.forEach((ele: any, index: any) => {
            if (ele.id == data[i]['id']) {
              selectedRecords.splice(index, 1);
            }
          })
          if (data[i].childRecords) {
            let childRecords = data[i].childRecords;
            filter(childRecords);
          }
        }
      }
      // parent loop 
      for (let i = 0; i < selectedRecords.length; i++) {
        rowIndexes.push(selectedRecords[i]['index']);
        if (selectedRecords[i].childRecords) {
          let childRecords = selectedRecords[i].childRecords;
          filter(childRecords);
        }
      }
      let filteredRecord = JSON.stringify(selectedRecords);

      //change id & taskId
      this.copiedRecord = this.changeCopiedRecordId(filteredRecord);
      this.treegrid.refresh();

      setTimeout(() => {
        // loop to change color of selected rows
        for (var i = 0; i < rowIndexes.length; i++) {
          const tds = this.treegrid.getRowByIndex(rowIndexes[i]).querySelectorAll('td');
          Array.from(tds).map((td: any) => td.style.background = 'pink'); //add Custom color to the corresponding selected row
        }
      }, 200)
    }

    const cutrow = () => {
      this.copyFlag = false;
      this.cutFlag = true;
      var selectedRecords = this.treegrid.getSelectedRecords() as any;
      var rowIndexes: any = [];

      // child loop to remove duplicates from selected records
      const filter = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          rowIndexes.push(data[i]['index']);
          selectedRecords.forEach((ele: any, index: any) => {
            if (ele.id == data[i]['id']) {
              selectedRecords.splice(index, 1);
            }
          })
          if (data[i].childRecords) {
            let childRecords = data[i].childRecords;
            filter(childRecords);
          }
        }
      }
      // parent loop 
      for (let i = 0; i < selectedRecords.length; i++) {
        rowIndexes.push(selectedRecords[i]['index']);
        if (selectedRecords[i].childRecords) {
          let childRecords = selectedRecords[i].childRecords;
          filter(childRecords);
        }
      }

      this.cutRecord = selectedRecords;
      console.log(this.cutRecord)
      // this.treegrid.selectRows(rowIndexes);
      this.treegrid.refresh();

      setTimeout(() => {
        // loop to change color of selected rows
        for (var i = 0; i < rowIndexes.length; i++) {
          const tds = this.treegrid.getRowByIndex(rowIndexes[i]).querySelectorAll('td');
          Array.from(tds).map((td: any) => td.style.background = 'pink'); //add Custom color to the corresponding selected row
        }
      }, 200)

    }

    const pastenext = () => {
      if (this.copyFlag) {
        let multipleRow = [];
        // console.log(this.rowIndex)
        for (let i = this.copiedRecord.length - 1; i >= 0; i--) {
          let data = this.copiedRecord[i]['taskData'];
          multipleRow.push(data);
          this.treegrid.addRecord(data, this.rowIndex, 'Below');
        }
        let flatData = (<any>document.querySelector('#treegrid')).ej2_instances[0].flatData[this.rowIndex];
        const mainParent = (tempData: any) => {
          if (tempData.parentItem) {
            mainParent(tempData.parentItem);
          }
          else {
            createSpinner({
              target: <any>document.getElementById('container')
            });
            showSpinner(<any>document.getElementById('container'));

            let dataToUpdate = tempData.taskData;
            this.apiCall.updateDroppedData(dataToUpdate).subscribe((res: any) => {
              this.copiedRecord = [];
              this.updateRowData();

              setTimeout(() => {
                this.treegrid.selectRow(this.rowIndex)
              }, 2000)

            })

          }
        }

        if (flatData.parentItem) {
          // console.log('having parent')
          mainParent(flatData);
        } else {
          // console.log('no parent')
          createSpinner({
            target: <any>document.getElementById('container')
          });
          showSpinner(<any>document.getElementById('container'));

          let rowData: any = flatData
          let parentData: any = this.treegrid.parentData;

          let parentIndex = parentData.findIndex((element: any) => {
            return element.taskID == rowData.taskID
          })

          this.apiCall.create(parentIndex, multipleRow).subscribe((res) => {
            // console.log(res)
            this.copiedRecord = [];
            this.updateRowData();

            setTimeout(() => {
              this.treegrid.selectRow(this.rowIndex)
            }, 2000)

          }, (error => { this.apiCall.handleError(error) }))

        }

      }
      if (this.cutFlag) {
        console.log('cut-paste-next')
        let multipleRow: any = [];
        let idToRemove: any = [];
        this.cutRecord.forEach((ele: any) => { idToRemove.push(ele.id) })
        const body: any = {
          idToRemove: idToRemove
        }



        for (let i = this.cutRecord.length - 1; i >= 0; i--) {
          let data = this.cutRecord[i];
          // console.log(this.cutRecord[i])

          let jsonObj: any = {};
          this.treegrid.columns.forEach((res: any) => {
            jsonObj[res.field] = data[res.field];
          })
          jsonObj['id'] = data.id;
          jsonObj['subtasks'] = data.subtasks;

          multipleRow.push(jsonObj);
          this.treegrid.addRecord(data, this.rowIndex, 'Below');
        }
        let flatData = (<any>document.querySelector('#treegrid')).ej2_instances[0].flatData[this.rowIndex];
        // console.log(flatData)
        const mainParent = (tempData: any) => {
          if (tempData.parentItem) {
            // //console.log(tempData.parentItem);
            mainParent(tempData.parentItem);
          }
          else {
            createSpinner({
              // Specify the target for the spinner to show
              target: <any>document.getElementById('container')
            });
            showSpinner(<any>document.getElementById('container'));

            // stop calling recurse()
            let dataToUpdate = tempData.taskData;

            //api call
            this.apiCall.deleteDragData(body).subscribe((res: any) => {
              // console.log(res)
              if (res.status) {
                setTimeout(() => {
                  this.apiCall.updateDroppedData(dataToUpdate).subscribe((res: any) => {
                    // console.log(res)
                    this.cutRecord = [];
                    this.updateRowData();

                    setTimeout(() => {
                      this.treegrid.selectRow(this.rowIndex)
                    }, 2000)

                  })
                }, 200)
              }
            });
          }
        }
        // mainParent(flatData);

        if (flatData.parentItem) {
          // console.log('having parent')
          mainParent(flatData);
        } else {
          // console.log('no parent')
          createSpinner({
            target: <any>document.getElementById('container')
          });
          showSpinner(<any>document.getElementById('container'));

          let rowData: any = flatData
          let parentData: any = this.treegrid.parentData;

          let parentIndex = parentData.findIndex((element: any) => {
            return element.taskID == rowData.taskID
          })

          // console.log(parentIndex)

          this.apiCall.deleteDragData(body).subscribe((res: any) => {
            // console.log(res)
            if (res.status) {
              setTimeout(() => {
                this.apiCall.create((parentIndex), multipleRow).subscribe((res) => {
                  // console.log(res)
                  this.copiedRecord = [];
                  this.updateRowData();

                  setTimeout(() => {
                    this.treegrid.selectRow(this.rowIndex)
                  },2000)

                }, (error => { this.apiCall.handleError(error) }))
              },200)
            }
          })
        }
      }
    }

    const pastechild = () => {

      if (this.copyFlag) {
        for (let i = this.copiedRecord.length - 1; i >= 0; i--) {
          let data = this.copiedRecord[i]['taskData'];
          this.treegrid.addRecord(data, this.rowIndex, 'Child');
        }
        let flatData = (<any>document.querySelector('#treegrid')).ej2_instances[0].flatData[this.rowIndex];
        const mainParent = (tempData: any) => {
          if (tempData.parentItem) {
            // //console.log(tempData.parentItem);
            mainParent(tempData.parentItem);
          }
          else {
            createSpinner({
              // Specify the target for the spinner to show
              target: <any>document.getElementById('container')
            });
            showSpinner(<any>document.getElementById('container'));
            // stop calling recurse()
            let dataToUpdate = tempData.taskData;
            this.apiCall.updateDroppedData(dataToUpdate).subscribe((res: any) => {
              // console.log(res)
              this.copiedRecord = [];
              this.updateRowData();

              setTimeout(() => {
                this.treegrid.selectRow(this.rowIndex)
              }, 2000)
            })
          }
        }
        mainParent(flatData);
      }

      if (this.cutFlag) {
        let idToRemove: any = [];
        this.cutRecord.forEach((ele: any) => { idToRemove.push(ele.id) })
        const body: any = {
          idToRemove: idToRemove
        }
        for (let i = this.cutRecord.length - 1; i >= 0; i--) {
          let data = this.cutRecord[i];
          this.treegrid.addRecord(data, this.rowIndex, 'Child');
        }
        let flatData = (<any>document.querySelector('#treegrid')).ej2_instances[0].flatData[this.rowIndex];
        const mainParent = (tempData: any) => {
          if (tempData.parentItem) {
            // //console.log(tempData.parentItem);
            mainParent(tempData.parentItem);
          }
          else {
            createSpinner({
              // Specify the target for the spinner to show
              target: <any>document.getElementById('container')
            });
            showSpinner(<any>document.getElementById('container'));

            // stop calling recurse()
            let dataToUpdate = tempData.taskData;

            //api call
            this.apiCall.deleteDragData(body).subscribe((res: any) => {
              if (res.status) {
                setTimeout(() => {
                  this.apiCall.updateDroppedData(dataToUpdate).subscribe((res: any) => {
                    this.cutRecord = [];
                    this.updateRowData();
                    setTimeout(() => {
                      this.treegrid.selectRow(this.rowIndex)
                    }, 2000)
                  })
                }, 200)
              }
            });
          }
        }
        mainParent(flatData);
      }

    }

    const handlerFunction: any = {
      'newCol': newColumnAlert,
      'deleteCol': deleteColumnAlert,
      'editCol': editColumn,
      'columnChooser': columnChooser,
      'filter': filter,
      'freeze': freezeColumn,
      'multisort': sortColumn,
      'dragdrop': dragDrop,
      'multiselect': multiSelect,
      'addchildnext': addchildnext,
      'addrownext': addrownext,
      'deleterow': deleterow,
      'editrow': editrow,
      'copyrow': copyrow,
      'cutrow': cutrow,
      'pastenext': pastenext,
      'pastechild': pastechild
    }

    var key = args.item.id as any;
    handlerFunction[key]();
  }

  latestId() {
    if (this.maximumId != 0) {
      this.dummyId = this.maximumId + 1
      this.maximumId = this.dummyId;
      return this.dummyId;
    } else {  // =0
      this.dummyId = this.getMax() + 1;
      this.maximumId = this.dummyId;
      return this.dummyId;
    }
  }

  changeCopiedRecordId(arg: any) {

    let data = JSON.parse(arg);

    const subtask = (val: any) => {
      for (let j = 0; j < val.length; j++) {
        let dummyId = this.latestId();
        val[j]['id'] = dummyId;
        val[j]['taskID'] = dummyId;
        if (val[j]['subtasks']) {
          subtask(val[j]['subtasks'])
        }
      }
    }
    for (let i = 0; i < data.length; i++) {
      let dummyId = this.latestId();
      data[i]['taskData']['id'] = dummyId;
      data[i]['taskData']['taskID'] = dummyId;
      if (data[i]['taskData']['subtasks']) {
        subtask(data[i]['taskData']['subtasks'])
      }
    }
    return data;

  }

  actionComplete(args: any): void {
    // console.log(args)
    if (args.requestType == 'delete') {
      const data = args.data[0];
      // const data = args.promise[0];
      if (!data.parentItem) { // delete parent including child data
        //console.log(data);
        const taskData = data.taskData;
        this.apiCall.delete(taskData.id).subscribe((res) => {
          //console.log(res)
        }, (error => {
          this.apiCall.handleError(error)
        }));
      }

      if (data.parentItem) {  // delete child alone
        const mainParent = (tempData: any) => {
          if (tempData.parentItem) {
            // //console.log(tempData.parentItem);
            mainParent(tempData.parentItem);
          }
          else {
            // stop calling recurse()
            let data = tempData.taskData;

            let jsonObj: any = {};
            this.treegrid.columns.forEach((res: any) => {
              jsonObj[res.field] = data[res.field];
            })
            jsonObj['id'] = data.id;
            jsonObj['subtasks'] = data.subtasks;

            this.apiCall.update(tempData.id, jsonObj).subscribe((res) => {
              //console.log(res)
            }, (error => {
              this.apiCall.handleError(error)
            }))
          }
        }
        mainParent(data);
      }
    }
    else if (args.action == 'edit') {
      const data = args.data
      this.treegrid.columns.forEach((res: any) => {
        if (res.field == 'taskID') {
          this.updateData[res.field] = parseInt(data[res.field]);
        }
        this.updateData[res.field] = data[res.field];
      })
      this.updateData['id'] = data.id;
      // this.updateData['taskID'] = data.id;

      const mainParent = (tempData: any) => {
        if (tempData.parentItem) {
          mainParent(tempData.parentItem);
        }
        else {
          let taskData: any;
          const parentId = tempData.id
          args.result.forEach((element: any) => {
            if (element.id == parentId) {
              taskData = element.taskData;
            }
          })
          this.treegrid.columns.forEach((res: any) => {
            this.jsonObj[res.field] = taskData[res.field];
          })
          this.jsonObj['id'] = taskData.id;
          this.jsonObj['subtasks'] = taskData.subtasks;
        }
      }

      mainParent(data);
      this.recurseEdit1();

    }
    else if (args.requestType == 'save' || args.requestType == 'cancel') {
      this.treegrid.editSettings.mode = 'Row';
      var index = args.index;

      var proxy = this.treegrid;
      // this.treegrid.selectRow(index);
      setTimeout(() => {
        proxy.selectRow(index);
      }, 100)
      if (args.action == 'add') {
        this.add(args)
      }
    }
    else if (args.requestType === 'columnstate') {
      for (var i = 0; i < this.headerObject.length; i++) {
        this.headerObject[i]['visible'] = (this.treegrid.columns[i] as any).visible;
      }
      this.apiCall.addHeader(this.headerObject).subscribe((res) => {
        // console.log(res)
      });
    }
    else if ((args.requestType === 'beginEdit')) {
      if (this.treegrid.editSettings.mode == 'Dialog') {
        const dialog = args.dialog;
        // change the header of the dialog
        dialog.header = 'Edit row';
      }
    }
    else if (args.requestType === 'reorder') {
      this.treegrid.treeColumnIndex = 1; // set your required treeColumnIndex
    }
  }

  add(args: any) {
    // add next/add child (tricky logic)
    const data = args.data
    if (!data.parentItem) { // add next -> add row newly (no parent/child)

      let rowData: any = this.treegrid.flatData[this.rowIndex]
      let parentData: any = this.treegrid.parentData;

      let parentIndex = parentData.findIndex((element: any) => {
        return element.taskID == rowData.taskID
      })

      let jsonObj: any = {};
      this.treegrid.columns.forEach((res: any) => {
        jsonObj[res.field] = data[res.field];
      })
      jsonObj['id'] = data.id;

      this.apiCall.create(parentIndex, [jsonObj]).subscribe((res) => {
        // console.log(res)
      }, (error => { this.apiCall.handleError(error) }))
    }
    if (data.parentItem) {  // add next/add child -> add row within a parent
      //console.log("Yes parent")
      const mainParent = (tempData: any) => {
        if (tempData.parentItem) {
          // //console.log(tempData.parentItem);
          mainParent(tempData.parentItem);
        }
        else {
          // stop calling recurse()
          let data = tempData.taskData;

          let jsonObj: any = {};
          this.treegrid.columns.forEach((res: any) => {
            jsonObj[res.field] = data[res.field];
          })
          jsonObj['id'] = data.id;
          jsonObj['subtasks'] = data.subtasks;
          // //console.log(jsonObj);

          this.apiCall.update(tempData.id, jsonObj).subscribe((res) => {
            //console.log(res)
          }, (error => {
            this.apiCall.handleError(error)
          }))
        }
      }
      mainParent(data);

    }
  }


  recurseEdit1() {
    if (this.jsonObj['id'] == this.updateData['id']) {
      this.headerName.forEach((res: any) => {
        this.jsonObj[res.field] = this.updateData[res.field];
      })
      this.apiCall.update(this.jsonObj['id'], this.jsonObj).subscribe((res) => {
        // console.log(res)
        // this.treegrid.refresh();
        // location.reload();
      }, (error => {
        this.apiCall.handleError(error)
      }))
      return;
    } else {
      if (this.jsonObj['subtasks']) {
        for (var i = 0; i < this.jsonObj['subtasks'].length; i++) {
          this.recurseEdit2(this.jsonObj['subtasks'][i])
        }
      }
      this.apiCall.update(this.jsonObj['id'], this.jsonObj).subscribe((res) => {
      }, (error => {
        this.apiCall.handleError(error)
      }))
    }

  }

  recurseEdit2(data: any) {
    // //console.log(data)
    if (data['id'] == this.updateData['id']) {
      this.headerName.forEach((res: any) => {
        if (res.field == "taskId") {
          data[res.field] = parseInt(this.updateData[res.field]);
        }
        data[res.field] = this.updateData[res.field];
      })
      return;
    } else {
      if (data['subtasks']) {
        for (var i = 0; i < data['subtasks'].length; i++) {
          this.recurseEdit2(data['subtasks'][i])
        }
      }
    }
  }

  dropDownSelect(args: any) {
    // console.log(args)

    let dragDrop = (<any>document.querySelector('#treegrid')).ej2_instances[0].allowRowDragAndDrop;
    /**
     * while enabling drag-drop, it's symbol is rendered in grid which occupies an extra <td> column at the first of tree grid.
     * so, 1 is added in columnIndex to get actual column index.
     * while disabling drag-drop, no symbol is rendered in tree grid.
     * it gives actual index of column. so, no need to add 1. 
     */
    let actualColIndex = (dragDrop) ? this.columnIndex + 1 : this.columnIndex;
    // //console.log(actualColIndex);

    const align = () => {
      this.editColumnForm.textAlign = args.itemData.text;
    }
    const fontColor = () => {
      this.editColumnForm.fontColor = args.itemData.text;
    }
    const bgColor = () => {
      this.editColumnForm.backgroundColor = (args.itemData.text == 'White') ? "" : args.itemData.text;
    }
    const fontSize = () => {
      this.editColumnForm.fontSize = (args.itemData.text == '13px') ? "13px" : args.itemData.text + 'px';
    }
    const dataType = () => {
      // var field = args.item.text;
      var field = args.itemData.text;

      // console.log(field)
      let dataTypes: any = {
        'Text': { type: 'string', editType: 'stringedit', format: '' },
        'Number': { type: 'number', editType: 'numberedit', format: '' },
        'Date': { type: 'date', editType: 'datepickeredit', format: 'MM/dd/yyyy' },
        'Boolean': { type: 'boolean', editType: 'booleanedit', format: '' },
        'DropDownList': { type: "none", editType: 'dropdownedit', format: '' },
      }
      if (this.columnName != 'taskID') {
        this.editColumnForm.type = dataTypes[field]['type'];
        this.editColumnForm.editType = dataTypes[field]['editType'];
        this.editColumnForm.format = dataTypes[field]['format'];
      }

      if (field == 'DropDownList') {
        this.editColumnForm.defaultValue = [];
        // console.log(this.editColumnForm);
      } else {
        this.editColumnForm.defaultValue = null;
        (<any>this.alertDialog).btnObj[0].disabled = true;
        // console.log(this.editColumnForm);
      }
    }
    const minColWidth = () => {
      this.editColumnForm.minWidth = args.itemData.text;
    }
    const handlerFunction: any = {
      'align': align,
      'fontColor': fontColor,
      'bgColor': bgColor,
      'fontSize': fontSize,
      'dataType': dataType,
      'minColWidth': minColWidth
    }
    // var key = args.item.id as any;

    var key = args.itemData.id;
    handlerFunction[key]();
    // this.alertDialog.hide();
  }

  changeHeader(event: any): void {
    let headerText = (document.getElementById('input') as any).value;
    if (headerText != '') {
      this.isColumnName = false;
      let trimmedInput = headerText.replace(/\s+/g, '');
      let isNameExist = this.headerTextCollection.find(element => element == trimmedInput)
      if (isNameExist == undefined) { // not exist
        this.isColumnName = false;
        (<any>this.alertDialog).btnObj[0].disabled = false;
        this.editColumnForm.headerText = headerText;
      } else {  //exist
        // console.log(isNameExist)
        // console.log(this.headerName)
        if (isNameExist == this.columnTitle) { //same column name
          this.isColumnName = false;
          (<any>this.alertDialog).btnObj[0].disabled = false;
          this.editColumnForm.headerText = headerText;
        } else {  // other column name
          this.isOtherColumnName = true;
          (<any>this.alertDialog).btnObj[0].disabled = true;
        }
      }
    } else {
      this.isColumnName = true;
      this.isOtherColumnName = false;
      (<any>this.alertDialog).btnObj[0].disabled = true;
    }
  }

  editInputChange(event: any) {
    // console.log(event)
    if (this.editColumnForm.type == 'string') {
      this.editColumnForm.defaultValue = event.target.value;
      if (this.editColumnForm.defaultValue == null || this.editColumnForm.defaultValue == "") {
        (<any>this.alertDialog).btnObj[0].disabled = true;
      } else {
        (<any>this.alertDialog).btnObj[0].disabled = false;
      }

      // console.log(this.editColumnForm)
    }
    if (this.editColumnForm.type == 'number') {
      this.editColumnForm.defaultValue = event.target.value;
      if (this.editColumnForm.defaultValue == null || this.editColumnForm.defaultValue == "") {
        (<any>this.alertDialog).btnObj[0].disabled = true;
      } else {
        (<any>this.alertDialog).btnObj[0].disabled = false;
      }
    }
    if (this.editColumnForm.type == 'date') {
      // console.log(this.editColumnForm);
      // console.log(event.value)
      this.editColumnForm.defaultValue = event.value;
      if (this.editColumnForm.defaultValue == null || this.editColumnForm.defaultValue == "") {
        (<any>this.alertDialog).btnObj[0].disabled = true;
      } else {
        (<any>this.alertDialog).btnObj[0].disabled = false;
      }
    }
    if (this.editColumnForm.type == 'boolean') {
      this.editColumnForm.defaultValue = event.value;
      if (this.editColumnForm.defaultValue == null) {
        (<any>this.alertDialog).btnObj[0].disabled = true;
      } else {
        (<any>this.alertDialog).btnObj[0].disabled = false;
      }
    }

  }

  addEditDDL() {
    console.log(this.editColumnForm)
    this.editColumnForm.defaultValue.push({ item: "" })
    this.checkEditDDL();
  }

  editDDL(index: any, event: any) {
    this.editColumnForm.defaultValue[index]['item'] = event.target.value;
    this.checkEditDDL();
  }

  deleteEditDDL(index: any) {
    this.editColumnForm.defaultValue.splice(index, 1);
    this.checkEditDDL();
  }

  checkEditDDL() {
    if (this.editColumnForm.editType == "dropdownedit") {
      if (this.editColumnForm.defaultValue.length == 0) {
        // console.log('form false')
        (<any>this.alertDialog).btnObj[0].disabled = true;
      } else {

        for (var i = 0; i < this.editColumnForm.defaultValue.length; i++) {
          if (this.editColumnForm.defaultValue[i]['item'] == null || this.editColumnForm.defaultValue[i]['item'] == '') {
            // console.log('empty');
            (<any>this.alertDialog).btnObj[0].disabled = true;
            return;
          } else {
            // console.log('not empty');
            (<any>this.alertDialog).btnObj[0].disabled = false;
          }
        }
      }
    }
  }

  changeColumnProperties() {
    createSpinner({
      target: <any>document.getElementById('container')
    });
    showSpinner(<any>document.getElementById('container'));

    // console.log(this.editColumnForm);

    this.headerObject[this.columnIndex].headerText = this.editColumnForm.headerText;
    this.headerObject[this.columnIndex].minWidth = this.editColumnForm.minWidth;
    this.headerObject[this.columnIndex].fontSize = this.editColumnForm.fontSize;
    this.headerObject[this.columnIndex].fontColor = this.editColumnForm.fontColor;
    this.headerObject[this.columnIndex].backgroundColor = this.editColumnForm.backgroundColor;
    this.headerObject[this.columnIndex].textAlign = this.editColumnForm.textAlign;
    this.headerObject[this.columnIndex].autoFit = this.editColumnForm.autoFit;

    this.headerObject[this.columnIndex].type = this.editColumnForm.type;
    this.headerObject[this.columnIndex].editType = this.editColumnForm.editType;
    this.headerObject[this.columnIndex].format = this.editColumnForm.format;
    this.headerObject[this.columnIndex].defaultValue = this.editColumnForm.defaultValue;

    // console.log(this.headerObject);

    this.apiCall.addHeader(this.headerObject).subscribe((res: any) => {
      // console.log(res)
      if (res) {
        this.apiCall.addHeaderDataType(this.headerObject, this.editColumnForm.type, this.columnName).subscribe((res) => {
          // console.log(res)
          if (res) {
            this.alertDialog.hide();
            // location.reload();
            this.ngOnInit();

          }
        });
      }
    });
  }

  editDialogBeforeClose(args: any) {
    this.columnHeaderName = "";
    this.colDataType = "";
    this.isColumnName = false;
    this.isOtherColumnName = false;
    this.headerTextCollection = []
  }

  closeAddColumn() {
    this.alertDialog2.hide();
    this.newColForm.reset();
  }

  newColNameExist(arg: any) {
    // console.log(arg);
    let trimmedInput = arg.target.value.replace(/\s+/g, '');
    let isNameExist = this.headerTextCollection.find(element => element == trimmedInput)
    // console.log(isNameExist)
    if (isNameExist == undefined) {
      this.isNewColNameRepeat = false;
    } else {
      // console.log('name repeat');
      this.isNewColNameRepeat = true;
      this.isFromValid = false;
    }
  }

  addColumn() {
    // console.log(this.newColForm);

    createSpinner({
      // Specify the target for the spinner to show
      target: <any>document.getElementById('container')
    });
    showSpinner(<any>document.getElementById('container'));


    let dataTypes: any = {
      'Text': { type: 'string', editType: 'stringedit', format: '' },
      'Number': { type: 'number', editType: 'numberedit', format: '' },
      'Date': { type: 'date', editType: 'datepickeredit', format: 'MM/dd/yyyy' },
      'Boolean': { type: 'boolean', editType: 'booleanedit', format: '' },
      'DropDownList': { type: "none", editType: 'dropdownedit', format: '' },
    }

    const body = {
      "autoFit": this.newColForm.value.columnTextWrap,
      "backgroundColor": (this.newColForm.value.columnBgColor == 'White') ? "" : this.newColForm.value.columnBgColor,
      "editType": dataTypes[this.newColForm.value.columnDataType]['editType'],
      "fontColor": this.newColForm.value.columnFontColor,
      "fontSize": (this.newColForm.value.columnFontSize == '13px') ? "13px" : this.newColForm.value.columnFontSize + 'px',
      "headerText": this.newColForm.value.colName,
      "isPrimaryKey": "",
      "minWidth": this.newColForm.value.columnMinWidth,
      "textAlign": this.newColForm.value.columnAlignment,
      "type": dataTypes[this.newColForm.value.columnDataType]['type'],
      "format": dataTypes[this.newColForm.value.columnDataType]['format'],

      "defaultValue": (this.newColForm.value.columnDataType == "DropDownList") ? this.newColForm.value.listItem : this.newColForm.value.defaultValue
    }

    // console.log(body)

    let i = 1;
    let ColName: string = 'newColumn' + i;
    const createHeaderName = (checkName: any) => {
      var isColExist = this.headerName.find((result: { field: any; }) => result.field == checkName);
      if (isColExist) {  //exist (true)
        // //console.log(ColName + ' exist')
        i++;
        ColName = 'newColumn' + i;
        createHeaderName(ColName);
      }
      else { //not exist (false)

        this.apiCall.addColumn(ColName, body).subscribe((res) => {
          // console.log(res);
          if (res) {
            this.alertDialog2.hide();
            // location.reload();
            this.ngOnInit();
          }
        }, (err) => {
          // console.log(err)
        });

      }
    }
    createHeaderName(ColName);

    // console.log(this.newColumnForm);

  }

  addNewListItem() {
    const add = this.newColForm.get('listItem') as FormArray;
    add.push(this.formBuilder.group({
      item: [],
    }));
    this.list = (<any>this.newColForm.get('listItem')).controls
  }

  deleteListItem(index: number) {
    const add = this.newColForm.get('listItem') as FormArray;
    add.removeAt(index)
  }

  dataTypeOnChange(arg: any) {
    this.newColForm.controls.defaultValue.reset();
  }

  newColDialogBeforeClose(args: any) {
    this.isColumnName = false;
    this.isNewColNameRepeat = false;
    (<any>document.getElementById('name')?.blur());
  }

  deleteColumn() {
    if (this.columnName != 'taskID') {
      createSpinner({
        // Specify the target for the spinner to show
        target: <any>document.getElementById('container')
      });
      showSpinner(<any>document.getElementById('container'));

      this.apiCall.deleteColumn(this.columnName).subscribe((res) => {
        if (res) {
          // console.log(res);
          // location.reload();
          this.ngOnInit();
        }
      }, (error) => {
        // console.log(error);
      });
      this.treegrid.columns.splice(this.columnIndex, 1);
      // this.treegrid.refreshColumns();
    }
  }

  deleteRow() {
    // this.treegrid.deleteRecord();

    let idToRemove: any = [];
    this.rowToDelete.forEach((ele: any) => { idToRemove.push(ele.id) })
    const body: any = {
      idToRemove: idToRemove
    }

    createSpinner({
      // Specify the target for the spinner to show
      target: <any>document.getElementById('container')
    });
    showSpinner(<any>document.getElementById('container'));


    //api call
    this.apiCall.deleteDragData(body).subscribe((res: any) => {
      if (res) {
        this.updateRowData();
      }
    });

    this.alertDialog4.hide();
  }

  checkBox(e: any) {
    const id = e.event.target.ej2_instances[0].wrapper.id;
    if (id == 'textWrap') {
      if (e.checked) {
        this.editColumnForm.autoFit = true;
      } else {
        this.editColumnForm.autoFit = false;
      }
    }
  }

  getMax() {
    let data: any = this.treegrid.flatData
    let count = this.treegrid.flatData.length;
    if (count !== 0) {
      this.maxId = data[0];
      for (let i = 0; i < count; i++) {
        if (data[i].id > this.maxId.id) {
          this.maxId = data[i];
        }
        if (data[i].subtasks) {
          // //console.log(data[i].subtasks)
          this.checkMax(data[i].subtasks);
        }
      }
    }
    return this.maxId.id;
  }

  checkMax(data: any) {
    let count = data.length;
    if (count !== 0) {
      for (let i = 0; i < count; i++) {
        if (data[i].id > this.maxId.id) {
          this.maxId = data[i];
        }
        if (data[i].subtasks) {
          this.checkMax(data[i].subtasks);
        }
      }
    }
  }

  columnDrop(args: any) {
    // createSpinner({
    //   // Specify the target for the spinner to show
    //   target: <any>document.getElementById('container')
    // });
    // showSpinner(<any>document.getElementById('container'));

    var fromIndex = args.column.index;
    // var toIndex = Number(args.target.closest('.e-headercell').ariaColIndex);
    var toIndex = Number(args.target.closest('.e-headercell').getAttribute("aria-colindex"));
    this.apiCall.reorderColumn(fromIndex, toIndex).subscribe((res) => {
      // location.reload();
      // this.ngOnInit();
    })
  }

  resizeStop(args: any) {
    this.apiCall.listHeader().subscribe((res: any) => {
      let headerObject = res
      for (var i = 0; i < headerObject.length; i++) {
        if (headerObject[i].field == args.column.field) {
          headerObject[i]['width'] = args.column.width;
        }
      }
      this.apiCall.addHeader(headerObject).subscribe((res) => {
        //console.log(res);
      });
    });
  }

  rowDrop(args: any) {
    // console.log(args);
    if (args.dropPosition != "middleSegment") {
      args.cancel = 'true'
      // alert("dropping disabled for parent row")     //alert message while dropping on parent row
    } else {
      var droppedIndex = args.dropIndex;
      let referenceData = this.treegrid.flatData[droppedIndex];

      let idToRemove: any[] = [];
      let droppedData = args.data;

      let dataToUpdate: any;

      const mainParent = (tempData: any) => {
        if (tempData.parentItem) {
          mainParent(tempData.parentItem);
        }
        else {
          // console.log(tempData)
          dataToUpdate = tempData.taskData;
        }
      }

      const collectIndexToRemove = () => {
        for (var i = 0; i < droppedData.length; i++) {
          idToRemove.push(droppedData[i]['id']);
        }
      }

      mainParent(referenceData);

      collectIndexToRemove();

      const body: any = {
        idToRemove: idToRemove
      }


      this.apiCall.deleteDragData(body).subscribe((res: any) => {
        // console.log(res)

        if (res.status) {

          setTimeout(() => {
            this.apiCall.updateDroppedData(dataToUpdate).subscribe((res: any) => {
              // console.log(res)
            })
          }, 500)
        }

      });
    }
  }

}





