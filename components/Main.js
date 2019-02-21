import React, { Component } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Home from "./Home";
import Learners from "./Learners";
import Courses from "./Courses";
import Lessons from "./Lessons";
import Projects from "./Projects";
import Reports from "./Reports";
import LearnerDetails from './LearnerDetails';
import CourseDetails from './CourseDetails';
import LessonDetails from './LessonDetails';
import ProjectDetails from './ProjectDetials';
import TaskDetails from './TaskDetails';
import Help from './Help';
import Maintyle from '../styles/mainStyles.css'; 

class Main extends Component {
  
  render() {
    return (
      <HashRouter>
        <div>
          <h1 className="mainStyle"><b>Smart Learn  ...... Task Your Mind</b></h1>
          <ul className="header">
            <li><NavLink exact to="/">Home</NavLink></li>
            <li><NavLink to="/learners">Learners</NavLink></li>
            <li><NavLink to="/courses">Courses</NavLink></li>
            <li><NavLink to="/projects">Projects</NavLink></li>
            <li><NavLink to="/reports">Reports</NavLink></li>
          </ul>
          <div className="content">
            <Route exact path="/" component={Home}/>
            <Route exact path="/learners" component={Learners}/>  
            <Route path="/learners/detail/:id" component={LearnerDetails}></Route> 
            <Route path="/courses/detail/:id" component={CourseDetails}></Route>
            <Route path="/projects/detail/:id" component={ProjectDetails}></Route>
            <Route path="/tasks/detail/:id/:projectNo" component={TaskDetails}></Route>
            <Route exact path="/lessons/:courseNo" component={Lessons}></Route>   
            <Route path="/lessons/detail/:id/:courseNo" component={LessonDetails}></Route>                   
            <Route exact path="/courses" component={Courses}/>
            <Route exact path="/lessons" component={Lessons}/>
            <Route exact path="/projects" component={Projects}/>
            <Route path="/reports" component={Reports}/>
            <Route path="/help" component={Help}/>
          </div>
        </div>
      </HashRouter>
    );
  }

} 

export default Main;