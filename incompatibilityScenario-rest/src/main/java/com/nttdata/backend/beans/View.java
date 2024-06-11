package com.nttdata.backend.beans;

import java.util.ArrayList;
import java.util.List;

public class View {
	
	private String name = "";
	
	private List<String> questions = new ArrayList<String>();
	private List<String> answers = new ArrayList<String>();
	private List<String> effort = new ArrayList<String>();
	private List<String> impacts = new ArrayList<String>();
	
	private List<String> results = new ArrayList<String>();

	private String viewResult = "";
	
	public View() {
		super();
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<String> getQuestions() {
		return questions;
	}

	public void setQuestions(List<String> questions) {
		this.questions = questions;
	}

	public List<String> getAnswers() {
		return answers;
	}

	public void setAnswers(List<String> answers) {
		this.answers = answers;
	}

	public List<String> getEffort() {
		return effort;
	}

	public void setEffort(List<String> effort) {
		this.effort = effort;
	}

	public List<String> getImpacts() {
		return impacts;
	}

	public void setImpacts(List<String> impacts) {
		this.impacts = impacts;
	}

	public List<String> getResults() {
		return results;
	}

	public void setResults(List<String> results) {
		this.results = results;
	}

	public String getViewResult() {
		return viewResult;
	}

	public void setViewResult(String viewResult) {
		this.viewResult = viewResult;
	}

	@Override
	public String toString() {
		return "ViewOut [name=" + name + ", questions=" + questions + ", answers=" + answers + ", effort=" + effort
				+ ", impacts=" + impacts + ", results=" + results + ", viewResult=" + viewResult + "]";
	}

}
