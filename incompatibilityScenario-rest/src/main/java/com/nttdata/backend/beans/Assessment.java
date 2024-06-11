package com.nttdata.backend.beans;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Assessment {
	
	private String name;
	private String organization;
	private String email;
	private boolean isViews;
	private boolean isDimensions;
	private List<Criteria> criteriaList = new ArrayList<Criteria>();
	private List<Result> resultList = new ArrayList<Result>();
	private String globalResult;
		
	public Assessment() {
		super();
	}

	public Assessment(String name, String organization, String email, boolean isViews, boolean isDimensions,
			List<Criteria> criteriaList, List<Result> resultList) {
		super();
		this.name = name;
		this.organization = organization;
		this.email = email;
		this.isViews = isViews;
		this.isDimensions = isDimensions;
		this.criteriaList = criteriaList;
		this.resultList = resultList;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getOrganization() {
		return organization;
	}

	public void setOrganization(String organization) {
		this.organization = organization;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public boolean isViews() {
		return isViews;
	}

	public void setViews(boolean isViews) {
		this.isViews = isViews;
	}

	public boolean isDimensions() {
		return isDimensions;
	}

	public void setDimensions(boolean isDimensions) {
		this.isDimensions = isDimensions;
	}

	public List<Criteria> getCriteriaList() {
		return criteriaList;
	}

	public void setCriteriaList(List<Criteria> criteriaList) {
		this.criteriaList = criteriaList;
	}

	public List<Result> getResultList() {
		return resultList;
	}

	public void setResultList(List<Result> resultList) {
		this.resultList = resultList;
	}

	public String getGlobalResult() {
		return globalResult;
	}

	public void setGlobalResult(String globalResult) {
		this.globalResult = globalResult;
	}

	@Override
	public String toString() {
		return "Assessment [name=" + name + ", organization=" + organization + ", email=" + email + ", isViews="
				+ isViews + ", isDimensions=" + isDimensions + ", criteriaList=" + criteriaList + ", resultList="
				+ resultList + ", globalResult=" + globalResult + "]";
	}

}
