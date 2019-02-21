import React, { Component } from "react";
import { useReactTable } from "react-table";
import "react-table/react-table.css";
import { Subject, empty, of } from 'rxjs';
import {
  flatMap,
  map,
  distinctUntilChanged,
  filter,
  catchError 
} from 'rxjs/operators';
import Select from 'react-select';
import LessonsTable from "./Tables/LessonsTable";
import TasksTable from './Tables/tasksTable';
import LearnersTable from './Tables/learnersTable';
import ReportData from './Reports/ReportData';

let reportCategorySubj = new Subject();
let reportListSubj = new Subject();

function LessonsContent(props) {
  const filter = props.filter.trim();
  
  return <LessonsTable  courseNo={filter}/>          
}

function TasksContent(props) {
  const filter = props.filter.trim();
  
  return <TasksTable  projectNo={filter}/>          
}

function LearnersContent(props) {
  const filter = props.filter.trim();
  
  return <LearnersTable  courseNo={filter}/>          
}

function NoContent(props) {
  const noContentMsg = props.noContentMsg;
  
  return <p>Unable to display report! {noContentMsg}</p>  
}

function ReportContent(props) {
  const readyForReport = props.readyForReport;
  const noContentMsg = props.noContentMsg;
  const filter = props.filter.trim();
  const reportCategory = props.reportCategory;
  const selectedReportId = props.selectedReportId;
  
  if (readyForReport) {
    if (reportCategory === "Trainer") {
      if (selectedReportId === "2") {
        return <LearnersContent filter={filter} />; 
      }
      if (selectedReportId === "1") {
        return <LessonsContent filter={filter} />;
      }    
    };
    if (reportCategory === "Manager") {
      return <TasksContent filter={filter} />;
    };
    if (reportCategory === "Learner") {
      if (selectedReportId === "1") {
        return <LearnersContent filter={filter} />;        
      }     
    };
  }
  return <NoContent noContentMsg={noContentMsg}/>;
}

class Reports extends Component {
   
  constructor(props) {
    super(props);
    this.state = {
      reportCategory: 'Learner',
      reportName: ' ',
      filter: ' ',
      filterType: ' ',
      readyForReport: false,
      noContentMsg: 'Are you missing a filter? Have you selected a report?',
      selectedReportId: '1',
      options: [],        
      selectedOption: null,
      reportList: ReportData,
      doRedirect: false             
    };   
  }

  componentDidMount() {
    this.initializeInputStream();
    this.initializeDataStreams();
    this.initializeReportSelectsSetState('Learner');
  };

  initializeInputStream() {
    reportCategorySubj.subscribe(val => {
      this.setState({
        reportCategory: val
      });      
      this.initializeReportSelectsSetState(val);
    });   
  }

  initializeDataStreams() {
   reportListSubj.subscribe(val => {             
      this.setState({
        reportList: val      
      });
   });     
  }

  initializeReportSelectsSetState(val) {    
    var filteredList = this.state.reportList;
    const currentReportCategory = val; 
    filteredList = filteredList.filter(item => item.reportCategory === currentReportCategory);
    filteredList = filteredList.map((item, index) => (
        {value: item.reportId, label: item.reportName}          
    ));  
    const preSelectReportId = '1'; 
    var preSelectReportName = 'Select';
    filteredList.map((item, index) => 
    {if (item.reportId === preSelectReportId)  
        {
          if (item.reportCategory === currentReportCategory) {
            preSelectReportName = item.reportName;
          }         
        }}
    );  
    const preSelectReport = {value: preSelectReportId, label: preSelectReportName};
    this.setState({   
        selectedOption: preSelectReport             
    });   
    this.setState({   
          options: filteredList             
    });
  }

  handleSelectReportChange = (selectedOption) => {
    this.setState({ readyForReport: false });  
    this.setState({ selectedOption });
    this.setState({ selectedReportId: selectedOption.value });
    this.setState({ filterType: " " });
    if (this.state.reportCategory === "Trainer") {
      if (selectedOption.value === "1") {
        this.setState({ filterType: "Course No" })
      };
      if (selectedOption.value === "2") {
        this.setState({ filterType: "Learner No" })
      };
    };
    if (this.state.reportCategory === "Manager") {
      if (selectedOption.value === "1") {
        this.setState({ filterType: "Project No" })
      };
    };
    if (this.state.reportCategory === "Learner") {
      if (selectedOption.value === "1") {
        this.setState({ filterType: "Learner No" })
      };
    };

  }

  handleFilterChange(e) {
    const tID =  e.target.id;
    const value = e.target.value;
    this.setState({filter: value.trim()});  
    this.setState({ readyForReport: false });  
  }  

  requestReport(e) {
    this.setState({readyForReport: true});   
  }

  render() {
    
    const {selectedOption} = this.state;
    const {reportCategory} = this.state;
    const {readyForReport} = this.state;
    const {selectedReportId} = this.state;
    const {noContentMsg} = this.state;
    const {filter} = this.state;
    
    return (
      <div>
        <div>
          <label>Choose Category : &nbsp; </label>
          <button onClick={() => reportCategorySubj.next("Learner")}>Learner</button>
          <button onClick={() => reportCategorySubj.next("Trainer")}>Trainer</button>
          <button onClick={() => reportCategorySubj.next("Manager")}>Manager</button>
        </div>
        <form  ref={(input) => {this.modifyForm = input}} className="form"
          onSubmit={(e)  => {this.requestReport(e)}}>
          <div className="form-group row">           
            <div className="col-3">
            <label>Select {this.state.reportCategory} - Report : &nbsp; </label>
            <Select 
            id="selectReport"
            style={{width: 120}}  value={selectedOption} 
            options={this.state.options}    
            onChange={(value) => this.handleSelectReportChange(value)} />          
            </div> 
            <div className="col-3">
            <label className="label" htmlFor="newItemInput">{this.state.filterType} Filter:</label>
            <input 
              type="text" placeholder="filter"  className="form-control" id="filter"
              style={{width: 200 }}
              value={this.state.filter} onChange={(value) => this.handleFilterChange(value)} />               
            </div> 
            <div className="col-1">
            <button type="submit" className="btn btn-pri">Get Report</button>
            </div>                   
          </div>
        </form> 
        <div>         
          <ReportContent 
          readyForReport={readyForReport}
          noContentMsg={noContentMsg}
          filter={filter}
          reportCategory={reportCategory}    
          selectedReportId={selectedReportId}      
           />          
        </div>
      </div>
    );
  }
}
 
export default Reports;