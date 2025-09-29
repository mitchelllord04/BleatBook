module com.example.goatdatabase {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.sql;


    opens com.example.goatdatabase to javafx.fxml;
    exports com.example.goatdatabase;
}