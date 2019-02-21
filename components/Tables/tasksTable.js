import React, { Component } from "react";
import { render } from "react-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";

class TasksTable extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      learnerData: [],
      isAPIDone: false   
    };
  }

  componentWillMount() {
    this.setState({
      isAPIDone: false
    });    
    var serviceURL = 'http://localhost:8080/api/task/ByProject/'
      +  this.props.projectNo;     
      fetch (serviceURL)
        .then(res => res.json())              
        .then(res => {
          this.initializeTaskListSetState(res);
      });   
      var serviceURL2 = 'http://localhost:8080/api/learner/learners/';       
      fetch (serviceURL2)
        .then(res => res.json())              
        .then(res => {
          this.initializeLearnerListSetState(res);
      });     
  }

  initializeTaskListSetState(taskList) {    
    this.setState({
        data: taskList            
    });
  }

  initializeLearnerListSetState(learnerList) {    
    this.setState({
        learnerData: learnerList            
    });
  }

  getLearnerName(learnerNo) {
    var learnerName = ' ';
    const learnerList = this.state.learnerData;

    learnerList.map((item, index) => { 
      if (item.learnerNo === learnerNo)  
      {
          learnerName = item.learnerName;
      }}
    );

    return learnerName;

  }

  render() {
    const { data } = this.state;

    return (
      <div>
      <ReactTable
        data={data}
        noDataText="No tasks found"
        columns={[
          {
            columns: [            
              {
                Header: "Task No",
                accessor: "taskNo",
                maxWidth: 80
              },
              {
                Header: "Task Name",
                accessor: "taskName",
                maxWidth: 300
              }, 
              {
                Header: "Task Notes",
                accessor: "taskDesc",
                maxWidth: 400
              },    
              {
                Header: "Learner Assigned",
                id: "learnNo", 
                accessor: (d) => { return this.getLearnerName(d.learnerNo); },
                maxWidth: 200
              },
              {
                Header: "% Done",
                accessor: "taskPctDone",
                maxWidth: 80
              }                
            ]
          }
        ]}
        defaultSorted={[
          {
            id: "taskNo",
            desc: false
          }
        ]}
        defaultPageSize={10}
        className="-striped -highlight"
      />
      <br />      
      </div>
    );
  }    
  
}
 
export default TasksTable;