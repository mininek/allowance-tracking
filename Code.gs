const app_const ={
  owner_name : 'B1',
  owner_email: 'B2',
  weekly_all: "B3",
  last_date: "B4",
  last_sum: 'B5',
  total:"B6",
  total_income: "B7",
  total_spend:"B8",
  data_start:11,
  income_cols: {dlr: "A", dt: "B", src:"C"},
  spend_cols: {dlr: "E", dt: "F", src:"G"},
  summary_range:'A1:B8',
  label: 'D1'
}
function onOpen(){
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu('Banking');
  menu.addItem('Recalculate Total for current sheet', 'recalculateTotal')
      .addItem('Email summary for All', 'weeklyEmail');
  menu.addToUi();
}
function recordLast(sheet_obj, number, message, add, date){
  if(add){
    message = "Added $"+number +" "+ message;
  }
  else{
    message = "Spent $"+number +" for "+ message; 
  }
  if(!date){
    date = new Date();
  }
  sheet_obj.getRange(app_const.last_date).setValue(Utilities.formatDate(date,"PST", "yyyy-MM-dd"));
  sheet_obj.getRange(app_const.last_sum).setValue(message);
}
function findLast(sheet_obj){
  let last_income_date = sheet_obj.getRange(app_const.income_cols.dt+app_const.data_start).getValue();
  let last_spend_date = sheet_obj.getRange(app_const.spend_cols.dt+app_const.data_start).getValue();
  let add =1;
  let last_row =[];
  let relevant_cols = app_const.income_cols;
  if(last_income_date<=last_spend_date){
    add =0;
    relevant_cols = app_const.spend_cols;
  }
  last_row = sheet_obj.getRange(relevant_cols.dlr+app_const.data_start+":"+relevant_cols.src+app_const.data_start).getValues()[0];
  recordLast(sheet_obj,last_row[0],last_row[2],add, last_row[1] );
}
function recalculateTotal(){
  let curr_sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  curr_sheet.setTabColor('green');
  calcTotal(curr_sheet);
  findLast(curr_sheet);
  curr_sheet.setTabColor(null);
}
function calcTotal(sheet_obj){
  let last_row = sheet_obj.getLastRow();
  let range_income_string = app_const.income_cols.dlr+app_const.data_start.toString()+":"+ app_const.income_cols.dlr+last_row.toString();
  let income_rows = sheet_obj.getRange(range_income_string).getValues().map(itm => Number(itm));
  let income_total = income_rows.reduce((prev, curr)=> prev+curr,0);
  let spend_rows = sheet_obj.getRange(range_income_string.replaceAll(app_const.income_cols.dlr,app_const.spend_cols.dlr)).getValues().map(itm => Number(itm));
  let spend_total = spend_rows.reduce((prev, curr)=> prev+curr,0);
  sheet_obj.getRange(app_const.total_income).setValue('$'+(income_total).toFixed(2));
  sheet_obj.getRange(app_const.total_spend).setValue('$'+(spend_total).toFixed(2));
  sheet_obj.getRange(app_const.total).setValue('$'+(income_total- spend_total).toFixed(2));
}
function sendSummary(sheet_obj, subject){
  let name = sheet_obj.getRange(app_const.owner_name).getValue();
  let email_address = sheet_obj.getRange(app_const.owner_email).getValue();
  if(!subject){subject = name + "'s account summary as of "+ Utilities.formatDate(new Date(),"PST", "yyyy-MM-dd");}
  let htmlBody = '<table></tr>'+sheet_obj.getRange(app_const.summary_range).getValues().map(rw =>( '<td><b>'+rw[0]+'</b></td><td>'+rw[1]+'</td>')).join('</tr><tr>') +'</tr></table>';
  console.log(htmlBody);
  MailApp.sendEmail({to:email_address, subject,htmlBody})
}

function weeklyEmail(){
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(itm => sendSummary(itm));
}
function weeklyAllowance(){
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(itm => addAllowance(itm));
}
function hourly_checkTransaction(){
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(itm => checkForTransaction(itm));
}

function checkForTransaction(sheet_obj){
  let label = sheet_obj.getRange(app_const.label).getValue();
  let gmail_label= GmailApp.getUserLabelByName(label);
  let unread_count = gmail_label.getUnreadCount();
  if(unread_count>0)
  {
    let unread_threads = gmail_label.getThreads(0,unread_count)
    let spending_details = unread_threads.map(itm =>{let msg = itm.getMessages()[0]; return [msg.getPlainBody().split('\r\n'), msg.getDate() ]});
    let num_lines = spending_details.length;
    let first_spend_row = app_const.spend_cols.dlr+app_const.data_start.toString()+":"+app_const.spend_cols.src+app_const.data_start.toString();
    for(let i =0; i<num_lines; i++){
      sheet_obj.getRange(first_spend_row).insertCells(SpreadsheetApp.Dimension.ROWS);
      sheet_obj.getRange(first_spend_row).setValues([[spending_details[i][0][0], spending_details[i][1],spending_details[i][0][1]]]);
      recordLast(sheet_obj,spending_details[i][0][0], spending_details[i][0][1], 0, spending_details[i][1] );
      unread_threads[i].markRead();
      calcTotal(sheet_obj);
      findLast(sheet_obj);
      sendSummary(sheet_obj, "You just spent $"+spending_details[i][0][0]);
    }
    
  }
  
}

function addAllowance(sheet_obj){
  let curr_sheet = sheet_obj;
  let first_income_row = app_const.income_cols.dlr+app_const.data_start.toString()+":"+app_const.income_cols.src+app_const.data_start.toString();
  curr_sheet.getRange(first_income_row).insertCells(SpreadsheetApp.Dimension.ROWS);
  let allowance_num = Number(curr_sheet.getRange(app_const.weekly_all).getValue()).toFixed(2);
  let todays_date = new Date();
  let message = "allowance";
  curr_sheet.getRange(first_income_row).setValues([[allowance_num, todays_date , message]]);
  calcTotal(sheet_obj);
  recordLast(sheet_obj,allowance_num, message, 1, todays_date );
}
