package com.nttdata.backend.beans;

public class SBB {
	
	private String name;
	private String type;
	private String concept;
	
	public SBB() {
		super();
	}

	public SBB(String name, String type, String concept, Boolean sbb, Boolean abb) {
		super();
		this.name = name;
		this.type = type;
		this.concept = concept;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
	public String getConcept() {
		return concept;
	}

	public void setConcept(String concept) {
		this.concept = concept;
	}

	@Override
	public String toString() {
		return "SBB [name=" + name + ", type=" + type + ", concept=" + concept + "]";
	}


}
