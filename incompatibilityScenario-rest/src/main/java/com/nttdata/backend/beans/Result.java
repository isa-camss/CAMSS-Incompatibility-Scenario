package com.nttdata.backend.beans;

public class Result {
	
	private String category;
	
	private String resultString;
	
	private Integer resultValue;
	
	public Result() {
	}

	public Result(String category, String resultString, Integer resultValue) {
		super();
		this.category = category;
		this.resultString = resultString;
		this.resultValue = resultValue;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getResultString() {
		return resultString;
	}

	public void setResultString(String resultString) {
		this.resultString = resultString;
	}

	public Integer getResultValue() {
		return resultValue;
	}

	public void setResultValue(Integer resultValue) {
		this.resultValue = resultValue;
	}

	@Override
	public String toString() {
		return "Result [category=" + category + ", resultString=" + resultString + ", resultValue=" + resultValue + "]";
	}
	
}
