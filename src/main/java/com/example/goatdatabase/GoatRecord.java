package com.example.goatdatabase;

import javafx.beans.property.SimpleStringProperty;

public class GoatRecord {
    private final SimpleStringProperty name;
    private final SimpleStringProperty weight;
    private final SimpleStringProperty DOB;
    private final SimpleStringProperty DOP;
    private final SimpleStringProperty meds;
    private final SimpleStringProperty vaccination;
    private final SimpleStringProperty dateTrimmed;
    private final SimpleStringProperty dateBred;
    private final SimpleStringProperty dueDate;
    private final SimpleStringProperty treatmentDate;

    public GoatRecord(String name, String weight, String DOB, String DOP, String meds, String vaccination,
                      String dateTrimmed, String dateBred, String dueDate, String treatmentDate) {
        this.name = new SimpleStringProperty(name);
        this.weight = new SimpleStringProperty(weight);
        this.DOB = new SimpleStringProperty(DOB);
        this.DOP = new SimpleStringProperty(DOP);
        this.meds = new SimpleStringProperty(meds);
        this.vaccination = new SimpleStringProperty(vaccination);
        this.dateTrimmed = new SimpleStringProperty(dateTrimmed);
        this.dateBred = new SimpleStringProperty(dateBred);
        this.dueDate = new SimpleStringProperty(dueDate);
        this.treatmentDate = new SimpleStringProperty(treatmentDate);
    }

    public String getName() {
        return name.get();
    }

    public String getWeight() {
        return  weight.get();
    }

    public String getDOB() {
        return DOB.get();
    }

    public String getDOP() {
        return DOP.get();
    }

    public String getMeds() {
        return meds.get();
    }

    public String getVaccination() {
        return vaccination.get();
    }

    public String getDateTrimmed() {
        return dateTrimmed.get();
    }

    public String getDateBred() {
        return dateBred.get();
    }

    public String getDueDate() {
        return dueDate.get();
    }

    public String getTreatmentDate() {
        return treatmentDate.get();
    }

}
