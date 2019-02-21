import React, { Component } from "react";
import { render } from "react-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";

class LearnersTable extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      isAPIDone: false   
    };
  }

  componentWillMount() {
    this.setState({
      isAPIDone: false
    });    
    var serviceURL = 'http://localhost:8080/api/learner/learners/';
      //+  this.props.projectNo;     
      fetch (serviceURL)
        .then(res => res.json())              
        .then(res => {
          this.initializeLearnerListSetState(res);
      });        
  }

  initializeLearnerListSetState(learnerList) {    
    this.setState({
        data: learnerList            
    });
  }

  render() {
    const { data } = this.state;
    return (
      <div>
      <ReactTable
        data={data}
        noDataText="No Learners found"
        columns={[
          {
            columns: [            
              {
                Header: "Learner No",
                accessor: "learnerNo",
                maxWidth: 80
              },
              {
                Header: "Learner Name",
                accessor: "learnerName",
                maxWidth: 300
              }, 
              {
                Header: "Learner Note",
                accessor: "learnerNote",
                maxWidth: 400
              }            
            ]
          }
        ]}
        defaultSorted={[
          {
            id: "learnerNo",
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
 
export default LearnersTable;