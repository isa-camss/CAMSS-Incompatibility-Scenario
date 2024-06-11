package com.nttdata.backend.beans;

import java.util.ArrayList;
import java.util.List;

public class AssessmentOLD {
	
	private String name;
	private String organization;
	private String email;
	
	private List<View> views = new ArrayList<View>();
	private List<Dimension> dimensions = new ArrayList<Dimension>();
	
	public AssessmentOLD() {
		super();
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

	public List<View> getViews() {
		return views;
	}

	public void setViews(List<View> views) {
		this.views = views;
	}

	public List<Dimension> getDimensions() {
		return dimensions;
	}

	public void setDimensions(List<Dimension> dimensions) {
		this.dimensions = dimensions;
	}

	

}
