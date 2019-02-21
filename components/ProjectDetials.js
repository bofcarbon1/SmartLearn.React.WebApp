import React, { Component } from 'react';
import {    
    Redirect
  } from "react-router-dom";
import ProjectStyles from '../styles/projectStyles.css';
import validationStyles from '../styles/validationStyles.css';
import { of } from 'rxjs';
import {
   catchError  
} from 'rxjs/operators';
import Project from '../models/Course';

class ProjectDetails extends Component {
  
    constructor(props) {
        super(props);

        this.state = {
            id: ' ',
            projectNo: ' ',
            projectName: ' ',
            projectDesc: ' ',
            buttonText: 'Add',
            validation1Msg: '',
            validation2Msg: '',
            doRedirect: false                 
        };
    }

    componentWillMount() {
        if (!(this.props.match.params.id === '0')) {
            var serviceURL = 'http://localhost:8080/api/project/ById/'
             +  this.props.match.params.id;            
            fetch (serviceURL)
                .then(res => res.json())              
                .then(res => {
                    this.initializeProjectDetailSetState(res);
                });                      
        }    
    }
    
    initializeProjectDetailSetState(projectDetail) {      
        this.setState({
            id: projectDetail.id,
            projectNo: projectDetail.projectNo,
            projectName: projectDetail.projectName,
            projectDesc: projectDetail.projectDesc,            
            buttonText: 'Update'        
          });             
    }  

    handleFormChange(e) {
        const tID =  e.target.id;
        const value = e.target.value;
        const target = e.target;
        var valMsg = target.validationMessage;

        if (tID === "projectNo") {
            this.setState({projectNo: value});  
            if (valMsg.includes("format")) {
                valMsg = valMsg + " should be like '99999' ";
            }
            this.setState({
                validation1Msg: valMsg 
            });    
        }    
        if (tID === "projectName") {
           this.setState({projectName: value});  
           this.setState({
            validation2Msg: target.validationMessage 
           }); 
        }
        if (tID === "projectDesc") {
           this.setState({projectDesc: value});     
        }                
    }
  
    modifyProject(e) {
        if (!(this.props.match.params.id === '0')) {
            this.updateProject(e)
        }
        else {
            e.preventDefault();
            var project = Project; 
            project.id = this.state.id;
            project.projectNo = this.state.projectNo;
            project.projectName = this.state.projectName;
            project.projectDesc = this.state.projectDesc;     
            
            const jBody = JSON.stringify(project);
            
            fetch(            
                `http://localhost:8080/api/project/add/`,
                {
                method: 'POST',  
                body: jBody,  
                headers:{
                'Content-Type': 'application/json' 
                }
            })
            .then(res => res.json())              
            .then(response => of({ apiStatus: JSON.stringify(response)})); //                     
                                  
            this.modifyForm.reset();
            this.forceUpdate(); 
        }
        
        this.setState( {doRedirect: true });
        
    }

    updateProject(e) {   
        var project = Project; 
        project.id = this.state.id;
        project.projectNo = this.state.projectNo;
        project.projectName = this.state.projectName;
        project.projectDesc = this.state.projectDesc;  

        const jBody = JSON.stringify(project);
                
        fetch(            
                `http://localhost:8080/api/project/update/`,
                {
                method: 'POST',  
                body: jBody,  
                headers:{
                'Content-Type': 'application/json' 
                }
        })
        .then(res => res.json())              
        .then(response => of({ apiStatus: JSON.stringify(response)})); //                     
                              
        this.modifyForm.reset();    
              
    }

    render() {
        if (this.state.doRedirect === true) {
            this.setState( {doRedirect: false });
            return (<Redirect to="/" />);
        }

        return (
          <div className="bgProject">                   
            <div
                style={{
                flex: 1,
                marginLeft: 30,
                width: 600,
                display: 'inline-block',
                color: 'white'
                }}
                > 
                    <h4>Project Details</h4> 
                    <form  ref={(input) => {this.modifyForm = input}} className="form"
                     onSubmit={(e)  => {this.modifyProject(e)}}>
                        <div className="form-group">
                        <div className="col-8">
                            <br/>
                            <label className="label" htmlFor="newItemInput">No:</label>
                            <input required pattern="[0-9]{5}" maxLength="5"
                            type="text" placeholder="Project No."  className="form-control" id="projectNo"
                            value={this.state.projectNo.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite">{this.state.validation1Msg}</span>
                            </div> 
                            <label className="label" htmlFor="newItemInput">Name:</label>
                            <input required maxLength="25"
                            type="text" placeholder="Project name"  className="form-control" id="projectName"
                            value={this.state.projectName.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                            <div className="invalid-feedback d-block">
                                <span class="error" aria-live="polite">{this.state.validation2Msg}</span>
                            </div> 
                            <label className="label" htmlFor="newItemInput">Description:</label>
                            <input   
                            type="text" placeholder="Note" className="form-control" id="projectDesc" style={{width: 500}}
                            value={this.state.projectDesc.trimLeft()} onChange={(value) => this.handleFormChange(value)} />
                        </div>
                        </div>
                        <br/>
                        <button type="submit" className="btn btn-pri">{this.state.buttonText}</button>
                        <br/><br/>
                    </form> 
                </div>     
          </div>
        );            
    }
}

export default ProjectDetails;