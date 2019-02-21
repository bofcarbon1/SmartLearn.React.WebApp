import React, { Component } from "react";
import { render } from "react-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";

class LessonsTable extends Component {
  
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
    var serviceURL = 'http://localhost:8080/api/lesson/ByCourse/'
      +  this.props.courseNo;     
      fetch (serviceURL)
        .then(res => res.json())              
        .then(res => {
          this.initializeLessonListSetState(res);
      });        
  }

  initializeLessonListSetState(lessonList) {    
    this.setState({
        data: lessonList            
    });
  }

  render() {
    const { data } = this.state;
    return (
      <div>
      <ReactTable
        data={data}
        noDataText="No lessons found"
        columns={[
          {
            columns: [            
              {
                Header: "Lesson",
                accessor: "lessonNo",
                maxWidth: 80
              },
              {
                Header: "Lesson Name",
                accessor: "lessonName",
                maxWidth: 300
              }, 
              {
                Header: "Lesson Description",
                accessor: "lessonDesc",
                maxWidth: 400
              }            
            ]
          }
        ]}
        defaultSorted={[
          {
            id: "LessonNo",
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
 
export default LessonsTable;