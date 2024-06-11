package com.nttdata.backend.beans;

public class Compare {
	
	private Assessment Assessment1;
	private Assessment Assessment2;
	
	public Compare() {
		super();
	}
	
	public Compare(Assessment assessment1, Assessment assessment2) {
		super();
		Assessment1 = assessment1;
		Assessment2 = assessment2;
	}

	public Assessment getAssessment1() {
		return Assessment1;
	}

	public void setAssessment1(Assessment assessment1) {
		Assessment1 = assessment1;
	}

	public Assessment getAssessment2() {
		return Assessment2;
	}

	public void setAssessment2(Assessment assessment2) {
		Assessment2 = assessment2;
	}

	@Override
	public String toString() {
		return "Compare [Assessment1=" + Assessment1 + ", Assessment2=" + Assessment2 + "]";
	}
	
}
