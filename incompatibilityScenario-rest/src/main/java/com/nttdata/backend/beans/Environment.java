package com.nttdata.backend.beans;

public class Environment {
	
	private String SBBName;
	private String SBBId;
	private String specificationsName;
	private String specificationsId;
	
	public Environment() {
		super();
	}

	public Environment(String sBBName, String sBBId, String specificationsName, String specificationsId) {
		super();
		SBBName = sBBName;
		SBBId = sBBId;
		this.specificationsName = specificationsName;
		this.specificationsId = specificationsId;
	}
	
	public void mergeEnvironment( Environment environment ) {
		if( environment.getSBBId() != null ) {
			setSBBId(environment.getSBBId());
		}
		if( environment.getSBBName() != null ) {
			setSBBName(environment.getSBBName());
		}
		if( environment.getSpecificationsId() != null ) {
			setSpecificationsId(environment.getSpecificationsId());
		}
		if( environment.getSpecificationsName() != null ) {
			setSpecificationsName(environment.getSpecificationsName());
		}
	}

	public String getSBBName() {
		return SBBName;
	}

	public void setSBBName(String sBBName) {
		SBBName = sBBName;
	}

	public String getSpecificationsName() {
		return specificationsName;
	}

	public void setSpecificationsName(String specificationsName) {
		this.specificationsName = specificationsName;
	}
	
	public String getSBBId() {
		return SBBId;
	}

	public void setSBBId(String sBBId) {
		SBBId = sBBId;
	}

	public String getSpecificationsId() {
		return specificationsId;
	}

	public void setSpecificationsId(String specificationsId) {
		this.specificationsId = specificationsId;
	}

	@Override
	public String toString() {
		return "Environment [SBBName=" + SBBName + ", SBBId=" + SBBId + ", specificationsName=" + specificationsName
				+ ", specificationsId=" + specificationsId + "]";
	}
	
}
