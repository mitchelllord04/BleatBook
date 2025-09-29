package com.example.goatdatabase;

import javafx.animation.PauseTransition;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.Event;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.util.Duration;

import java.io.File;
import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.*;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class GoatDatabase extends Application {
    private static final Font headerFont = Font.font("Palatino Linotype", 100);
    private static final Font headerFont2 = Font.font("Palatino Linotype", 50);
    private static final Font captionFont = Font.font("Palatino Linotype", 30);
    private static final Font captionFont2 = Font.font("Palatino Linotype", 22);
    private static final Font buttonFont = Font.font("Palatino Linotype", 20);

    @Override
    public void start(Stage stage) throws IOException {
        StackPane root = new StackPane();
        VBox item = new VBox();

        ImageView bg = getBG("titleScreen.jpg", stage);

        Text title = new Text("BleatBook");

        title.setFill(Color.BLACK);
        title.setFont(headerFont);

        item.getChildren().add(title);
        root.getChildren().addAll(bg, item);

        item.setAlignment(Pos.TOP_CENTER);

        Scene scene = new Scene(root);

        stage.setFullScreen(true);
        stage.setFullScreenExitHint("");

        Platform.runLater( () -> {
                    item.setPadding(new Insets(scene.getHeight() * 0.1, 0, 0, 0));
                }
        );

        stage.setScene(scene);
        stage.show();

        PauseTransition delay = new PauseTransition(Duration.seconds(1.2));
        delay.setOnFinished(
                e -> {mainMenu(stage);}
        );
        delay.play();
    }

    public static void mainMenu(Stage stage) {
        StackPane root = new StackPane();
        HBox row1 = new HBox();
        HBox row2 = new HBox();
        VBox items = new VBox();
        AnchorPane exitButton = new AnchorPane();

        Text exit = exitButton();
        exit.setOnMouseClicked(x -> Platform.exit());

        exitButton.setPickOnBounds(false);

        AnchorPane.setTopAnchor(exit, 50.0);
        AnchorPane.setRightAnchor(exit, 50.0);

        BackgroundImage backgroundImage = getBackgroundImage();

        root.setBackground(new Background(backgroundImage));

        Text header = new Text("\uD83D\uDC10 Main Menu \uD83D\uDC10");
        header.setFont(headerFont2);
        header.setUnderline(true);

        Text prompt = new Text("Choose an option:");
        prompt.setFont(captionFont);

        ComboBox<String> choices = new ComboBox<>();
        choices.setStyle("-fx-font-family: Palatino Linotype; -fx-font-size: 20");

        choices.getItems().addAll("Add goat", "View goats", "Modify entry", "Delete entry");

        row1.getChildren().addAll(prompt, choices);

        Button confirm = new Button("Confirm");
        confirm.setFont(buttonFont);

        row2.getChildren().add(confirm);
        items.getChildren().addAll(header, row1, row2);
        exitButton.getChildren().add(exit);
        root.getChildren().addAll(items, exitButton);

        items.setAlignment(Pos.CENTER);
        row1.setAlignment(Pos.CENTER);
        row2.setAlignment(Pos.CENTER);

        Scene scene = stage.getScene();
        scene.setRoot(root);

        row1.setSpacing(scene.getWidth() * 0.007);
        row2.setSpacing(scene.getWidth() * 0.005);
        items.setSpacing(scene.getWidth() * 0.02);

        confirm.setOnAction(
                e -> {
                    if (choices.getValue() == null)
                        mainMenu(stage);

                    switch (choices.getValue()) {
                        case "Add goat":
                            addGoat(stage);
                            break;
                        case "View goats":
                            displayTable(stage);
                            break;
                        case "Modify entry":
                            modifyEntry(stage);
                            break;
                        case "Delete entry":
                            deleteEntry(stage);
                            break;
                        default:
                            mainMenu(stage);
                    }
                }
        );
    }

    private static BackgroundImage getBackgroundImage() {
        Image image = new Image("bg.png");

        BackgroundSize backgroundSize = new BackgroundSize(
                100, 100, // width & height as percentage
                true, true, // treat width & height as percentages
                true, true// no containment/preservation
        );

        BackgroundImage backgroundImage = new BackgroundImage(
                image,
                BackgroundRepeat.NO_REPEAT,
                BackgroundRepeat.NO_REPEAT,
                BackgroundPosition.CENTER,
                backgroundSize
        );
        return backgroundImage;
    }

    //done
    public static void addGoat(Stage stage) {
        StackPane root = new StackPane();
        VBox items = new VBox();
        HBox nameBox = new HBox();
        HBox weightBox = new HBox();
        HBox dobBox = new HBox();
        HBox dopBox = new HBox();
        HBox medsBox = new HBox();
        HBox vaccinationsBox = new HBox();
        HBox trimDateBox = new HBox();
        HBox dateBredBox = new HBox();
        HBox dueDateBox = new HBox();
        HBox treatmentDateBox = new HBox();
        HBox buttonsBox = new HBox();
        AnchorPane textButtonsBox = new AnchorPane();

        BackgroundImage backgroundImage = getBackgroundImage();

        root.setBackground(new Background(backgroundImage));

        Text back = backButton();
        back.setOnMouseClicked(a -> mainMenu(stage));

        Text exit = exitButton();
        exit.setOnMouseClicked(x -> Platform.exit());

        Text menu = menuButton();
        menu.setOnMouseClicked(c -> {settings(stage);});

        textButtonsBox.setPickOnBounds(false);

        AnchorPane.setTopAnchor(back, 50.0);
        AnchorPane.setLeftAnchor(back, 50.0);

        AnchorPane.setTopAnchor(exit, 50.0);
        AnchorPane.setRightAnchor(exit, 50.0);

        AnchorPane.setBottomAnchor(menu, 50.0);
        AnchorPane.setLeftAnchor(menu, 50.0);

        Text title = new Text("\uD83D\uDC10 Add Goat \uD83D\uDC10");
        title.setFont(headerFont2);
        title.setUnderline(true);

        Text name = new Text("Name:");
        TextField nameField = new TextField();

        name.setFont(captionFont2);
        nameField.setFont(captionFont2);

        Text weight = new Text("Weight:");
        TextField weightField = new TextField();

        weight.setFont(captionFont2);
        weightField.setFont(captionFont2);

        Text dob = new Text("DOB:");
        TextField dobField = new TextField();

        dob.setFont(captionFont2);
        dobField.setFont(captionFont2);

        Text dop = new Text("DOP:");
        TextField dopField = new TextField();

        dop.setFont(captionFont2);
        dopField.setFont(captionFont2);

        Text meds = new Text("Medications:");
        TextField medsField = new TextField();

        meds.setFont(captionFont2);
        medsField.setFont(captionFont2);

        Text vaccinations = new Text("Vaccinations:");
        TextField vaccinationsField = new TextField();

        vaccinations.setFont(captionFont2);
        vaccinationsField.setFont(captionFont2);

        Text trimDate = new Text("Trim date:");
        TextField trimDateField = new TextField();

        trimDate.setFont(captionFont2);
        trimDateField.setFont(captionFont2);

        Text dateBred = new Text("Date bred:");
        TextField dateBredField = new TextField();

        dateBred.setFont(captionFont2);
        dateBredField.setFont(captionFont2);

        Text dueDate = new Text("Due date:");
        TextField dueDateField = new TextField();

        dueDate.setFont(captionFont2);
        dueDateField.setFont(captionFont2);

        Text treatmentDate = new Text("Treatment Date:");
        TextField treatmentDateField = new TextField();

        treatmentDate.setFont(captionFont2);
        treatmentDateField.setFont(captionFont2);

        Button add = new Button("Add");
        Button reset = new Button("Reset");

        add.setFont(buttonFont);
        reset.setFont(buttonFont);

        nameBox.getChildren().addAll(name, nameField);
        weightBox.getChildren().addAll(weight, weightField);
        dobBox.getChildren().addAll(dob, dobField);
        dopBox.getChildren().addAll(dop, dopField);
        medsBox.getChildren().addAll(meds, medsField);
        vaccinationsBox.getChildren().addAll(vaccinations, vaccinationsField);
        trimDateBox.getChildren().addAll(trimDate, trimDateField);
        dateBredBox.getChildren().addAll(dateBred, dateBredField);
        dueDateBox.getChildren().addAll(dueDate, dueDateField);
        treatmentDateBox.getChildren().addAll(treatmentDate, treatmentDateField);
        buttonsBox.getChildren().addAll(add, reset);
        items.getChildren().addAll(title, nameBox, weightBox, dobBox, dopBox, medsBox, vaccinationsBox, trimDateBox, dateBredBox, dueDateBox, treatmentDateBox, buttonsBox);
        textButtonsBox.getChildren().addAll(back, exit, menu);
        root.getChildren().addAll(items, textButtonsBox);

        nameBox.setAlignment(Pos.CENTER);
        weightBox.setAlignment(Pos.CENTER);
        dobBox.setAlignment(Pos.CENTER);
        dopBox.setAlignment(Pos.CENTER);
        medsBox.setAlignment(Pos.CENTER);
        vaccinationsBox.setAlignment(Pos.CENTER);
        trimDateBox.setAlignment(Pos.CENTER);
        dateBredBox.setAlignment(Pos.CENTER);
        dueDateBox.setAlignment(Pos.CENTER);
        treatmentDateBox.setAlignment(Pos.CENTER);
        buttonsBox.setAlignment(Pos.CENTER);
        items.setAlignment(Pos.CENTER);

        Scene scene = stage.getScene();
        scene.setRoot(root);

        items.setSpacing(scene.getHeight() * 0.027);
        nameBox.setSpacing(scene.getWidth() * 0.008);
        weightBox.setSpacing(scene.getWidth() * 0.008);
        dobBox.setSpacing(scene.getWidth() * 0.008);
        dopBox.setSpacing(scene.getWidth() * 0.008);
        medsBox.setSpacing(scene.getWidth() * 0.008);
        vaccinationsBox.setSpacing(scene.getWidth() * 0.008);
        trimDateBox.setSpacing(scene.getWidth() * 0.008);
        dateBredBox.setSpacing(scene.getWidth() * 0.008);
        dueDateBox.setSpacing(scene.getWidth() * 0.008);
        treatmentDateBox.setSpacing(scene.getWidth() * 0.008);
        buttonsBox.setSpacing(scene.getWidth() * 0.008);

        add.setOnAction(
                e -> {
                    String goatName = nameField.getText();
                    String goatWeight = weightField.getText();
                    String goatDOB = dobField.getText();
                    String goatDOP = dopField.getText();
                    String goatMeds = medsField.getText();
                    String goatVaccinations = vaccinationsField.getText();
                    String lastTrim = trimDateField.getText();
                    String breedDate = dateBredField.getText();
                    String goatDueDate = dueDateField.getText();
                    String goatTreatmentDate = treatmentDateField.getText();

                    if (goatName.isBlank() || goatWeight.isBlank() || goatDOB.isBlank() || goatDOP.isBlank() || goatMeds.isBlank() || goatVaccinations.isBlank() || lastTrim.isBlank() || breedDate.isBlank() || goatDueDate.isBlank() || goatTreatmentDate.isBlank()) {
                        Text[] texts = {name, weight, dob, dop, meds, vaccinations, trimDate, dateBred, dueDate, treatmentDate};
                        TextField[] fields = {nameField, weightField, dobField, dopField, medsField, vaccinationsField, trimDateField, dateBredField, dueDateField, treatmentDateField};

                        for (int i = 0; i < fields.length; i++) {
                            if (fields[i].getText().isBlank()) {
                                texts[i].setFill(Color.RED);
                            } else {
                                texts[i].setFill(Color.BLACK);
                            }
                        }
                    } else {
                        addToDB(stage, goatName, goatWeight, goatDOB, goatDOP, goatMeds, goatVaccinations, lastTrim, breedDate, goatDueDate, goatTreatmentDate);
                    }
                }
        );

        reset.setOnAction(
                e -> {addGoat(stage);}
        );
    }

    //Overloaded for modifying entries
    //done
    public static void addGoat(Stage stage, List<String> data) {
        StackPane root = new StackPane();
        VBox items = new VBox();
        HBox nameBox = new HBox();
        HBox weightBox = new HBox();
        HBox dobBox = new HBox();
        HBox dopBox = new HBox();
        HBox medsBox = new HBox();
        HBox vaccinationsBox = new HBox();
        HBox trimDateBox = new HBox();
        HBox dateBredBox = new HBox();
        HBox dueDateBox = new HBox();
        HBox treatmentDateBox = new HBox();
        HBox buttonsBox = new HBox();
        AnchorPane textButtonsBox = new AnchorPane();

        Text menu = menuButton();
        menu.setOnMouseClicked(c -> {settings(stage);});

        BackgroundImage backgroundImage = getBackgroundImage();

        root.setBackground(new Background(backgroundImage));

        Text back = backButton();
        back.setOnMouseClicked(a -> mainMenu(stage));

        Text exit = exitButton();
        exit.setOnMouseClicked(x -> Platform.exit());

        textButtonsBox.setPickOnBounds(false);

        AnchorPane.setTopAnchor(back, 50.0);
        AnchorPane.setLeftAnchor(back, 50.0);

        AnchorPane.setTopAnchor(exit, 50.0);
        AnchorPane.setRightAnchor(exit, 50.0);

        AnchorPane.setBottomAnchor(menu, 50.0);
        AnchorPane.setLeftAnchor(menu, 50.0);

        Text title = new Text("\uD83D\uDC10 Modify Entry \uD83D\uDC10");
        title.setFont(headerFont2);
        title.setUnderline(true);

        Text name = new Text("Name:");
        TextField nameField = new TextField();
        nameField.setText(data.get(0));

        name.setFont(captionFont2);
        nameField.setFont(captionFont2);

        Text weight = new Text("Weight:");
        TextField weightField = new TextField();
        weightField.setText(data.get(1));

        weight.setFont(captionFont2);
        weightField.setFont(captionFont2);

        Text dob = new Text("DOB:");
        TextField dobField = new TextField();
        dobField.setText(data.get(2));

        dob.setFont(captionFont2);
        dobField.setFont(captionFont2);

        Text dop = new Text("DOP:");
        TextField dopField = new TextField();
        dopField.setText(data.get(3));

        dop.setFont(captionFont2);
        dopField.setFont(captionFont2);

        Text meds = new Text("Medications:");
        TextField medsField = new TextField();
        medsField.setText(data.get(4));

        meds.setFont(captionFont2);
        medsField.setFont(captionFont2);

        Text vaccinations = new Text("Vaccinations:");
        TextField vaccinationsField = new TextField();
        vaccinationsField.setText(data.get(5));

        vaccinations.setFont(captionFont2);
        vaccinationsField.setFont(captionFont2);

        Text trimDate = new Text("Trim date:");
        TextField trimDateField = new TextField();
        trimDateField.setText(data.get(6));

        trimDate.setFont(captionFont2);
        trimDateField.setFont(captionFont2);

        Text dateBred = new Text("Date bred:");
        TextField dateBredField = new TextField();
        dateBredField.setText(data.get(7));

        dateBred.setFont(captionFont2);
        dateBredField.setFont(captionFont2);

        Text dueDate = new Text("Due date:");
        TextField dueDateField = new TextField();
        dueDateField.setText(data.get(8));

        dueDate.setFont(captionFont2);
        dueDateField.setFont(captionFont2);

        Text treatmentDate = new Text("Treatment Date:");
        TextField treatmentDateField = new TextField();
        treatmentDateField.setText(data.get(9));

        treatmentDate.setFont(captionFont2);
        treatmentDateField.setFont(captionFont2);

        Button confirm = new Button("Confirm");
        Button reset = new Button("Reset");

        confirm.setFont(captionFont2);
        reset.setFont(captionFont2);

        nameBox.getChildren().addAll(name, nameField);
        weightBox.getChildren().addAll(weight, weightField);
        dobBox.getChildren().addAll(dob, dobField);
        dopBox.getChildren().addAll(dop, dopField);
        medsBox.getChildren().addAll(meds, medsField);
        vaccinationsBox.getChildren().addAll(vaccinations, vaccinationsField);
        trimDateBox.getChildren().addAll(trimDate, trimDateField);
        dateBredBox.getChildren().addAll(dateBred, dateBredField);
        dueDateBox.getChildren().addAll(dueDate, dueDateField);
        treatmentDateBox.getChildren().addAll(treatmentDate, treatmentDateField);
        buttonsBox.getChildren().addAll(confirm, reset);
        items.getChildren().addAll(title, nameBox, weightBox, dobBox, dopBox, medsBox, vaccinationsBox, trimDateBox, dateBredBox, dueDateBox, treatmentDateBox, buttonsBox);
        textButtonsBox.getChildren().addAll(back, exit, menu);
        root.getChildren().addAll(items, textButtonsBox);

        nameBox.setAlignment(Pos.CENTER);
        weightBox.setAlignment(Pos.CENTER);
        dobBox.setAlignment(Pos.CENTER);
        dopBox.setAlignment(Pos.CENTER);
        medsBox.setAlignment(Pos.CENTER);
        vaccinationsBox.setAlignment(Pos.CENTER);
        trimDateBox.setAlignment(Pos.CENTER);
        dateBredBox.setAlignment(Pos.CENTER);
        dueDateBox.setAlignment(Pos.CENTER);
        treatmentDateBox.setAlignment(Pos.CENTER);
        buttonsBox.setAlignment(Pos.CENTER);
        items.setAlignment(Pos.CENTER);

        Scene scene = stage.getScene();
        scene.setRoot(root);

        items.setSpacing(scene.getHeight() * 0.027);
        nameBox.setSpacing(scene.getWidth() * 0.008);
        weightBox.setSpacing(scene.getWidth() * 0.008);
        dobBox.setSpacing(scene.getWidth() * 0.008);
        dopBox.setSpacing(scene.getWidth() * 0.008);
        medsBox.setSpacing(scene.getWidth() * 0.008);
        vaccinationsBox.setSpacing(scene.getWidth() * 0.008);
        trimDateBox.setSpacing(scene.getWidth() * 0.008);
        dateBredBox.setSpacing(scene.getWidth() * 0.008);
        dueDateBox.setSpacing(scene.getWidth() * 0.008);
        treatmentDateBox.setSpacing(scene.getWidth() * 0.008);
        buttonsBox.setSpacing(scene.getWidth() * 0.008);

        confirm.setOnAction(
                e -> {
                    String goatName = nameField.getText();
                    String goatWeight = weightField.getText();
                    String goatDOB = dobField.getText();
                    String goatDOP = dopField.getText();
                    String goatMeds = medsField.getText();
                    String goatVaccinations = vaccinationsField.getText();
                    String lastTrim = trimDateField.getText();
                    String breedDate = dateBredField.getText();
                    String goatDueDate = dueDateField.getText();
                    String goatTreatmentDate = treatmentDateField.getText();

                    if (goatName.isBlank() || goatWeight.isBlank() || goatDOB.isBlank() || goatDOP.isBlank() || goatMeds.isBlank() || goatVaccinations.isBlank() || lastTrim.isBlank() || breedDate.isBlank() || goatDueDate.isBlank() || goatTreatmentDate.isBlank()) {
                        Text[] texts = {name, weight, dob, dop, meds, vaccinations, trimDate, dateBred, dueDate, treatmentDate};
                        TextField[] fields = {nameField, weightField, dobField, dopField, medsField, vaccinationsField, trimDateField, dateBredField, dueDateField, treatmentDateField};

                        for (int i = 0; i < fields.length; i++) {
                            if (fields[i].getText().isBlank()) {
                                texts[i].setFill(Color.RED);
                            } else {
                                texts[i].setFill(Color.BLACK);
                            }
                        }
                    } else {
                        deleteFromDB(stage, data.get(0), false);
                        addToDB(stage, goatName, goatWeight, goatDOB, goatDOP, goatMeds, goatVaccinations, lastTrim, breedDate, goatDueDate, goatTreatmentDate);
                    }
                }
        );

        reset.setOnAction(
                e -> {addGoat(stage, data);}
        );
    }

    public static void displayTable(Stage stage) {
        TableView<GoatRecord> table = new TableView<>();

        TableColumn<GoatRecord, String> nameCol = new TableColumn<>("Name");
        nameCol.setCellValueFactory(new PropertyValueFactory<>("name"));

        TableColumn<GoatRecord, String> weightCol = new TableColumn<>("Weight");
        weightCol.setCellValueFactory(new PropertyValueFactory<>("weight"));

        TableColumn<GoatRecord, String> dobCol = new TableColumn<>("DOB");
        dobCol.setCellValueFactory(new PropertyValueFactory<>("DOB"));

        TableColumn<GoatRecord, String> dopCol = new TableColumn<>("DOP");
        dopCol.setCellValueFactory(new PropertyValueFactory<>("DOP"));

        TableColumn<GoatRecord, String> medsCol = new TableColumn<>("Meds");
        medsCol.setCellValueFactory(new PropertyValueFactory<>("meds"));

        TableColumn<GoatRecord, String> vaccinationCol = new TableColumn<>("Vaccination");
        vaccinationCol.setCellValueFactory(new PropertyValueFactory<>("vaccination"));

        TableColumn<GoatRecord, String> dateTrimmedCol = new TableColumn<>("Date Trimmed");
        dateTrimmedCol.setCellValueFactory(new PropertyValueFactory<>("dateTrimmed"));

        TableColumn<GoatRecord, String> dateBredCol = new TableColumn<>("Date Bred");
        dateBredCol.setCellValueFactory(new PropertyValueFactory<>("dateBred"));

        TableColumn<GoatRecord, String> dueDateCol = new TableColumn<>("Due Date");
        dueDateCol.setCellValueFactory(new PropertyValueFactory<>("dueDate"));

        TableColumn<GoatRecord, String> treatmentDateCol = new TableColumn<>("Treatment Date");
        treatmentDateCol.setCellValueFactory(new PropertyValueFactory<>("treatmentDate"));

        table.getColumns().addAll(
                nameCol,
                weightCol,
                dobCol,
                dopCol,
                medsCol,
                vaccinationCol,
                dateTrimmedCol,
                dateBredCol,
                dueDateCol,
                treatmentDateCol
        );

        medsCol.prefWidthProperty().bind(table.widthProperty().multiply(0.2));

        table.setRowFactory(tv -> {
            TableRow<GoatRecord> row = new TableRow<>();

            row.setOnMouseClicked(event -> {
                if (!row.isEmpty() && event.getClickCount() == 2) {
                    GoatRecord selectedGoat = row.getItem();

                    String name = selectedGoat.getName();

                    viewEntry(stage, getGoat(stage, name), true);
                }
            });

            return row;
        });

        ObservableList<GoatRecord> goats = FXCollections.observableArrayList();

        try (Connection conn = DriverManager.getConnection("jdbc:sqlite:GOAT_RECORDS.db");
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT * FROM GOAT_RECORDS")) {

            while (rs.next()) {
                goats.add(new GoatRecord(
                        rs.getString("name"),
                        rs.getString("weight"),
                        rs.getString("DOB"),
                        rs.getString("DOP"),
                        rs.getString("meds"),
                        rs.getString("vaccinations"),
                        rs.getString("dateTrimmed"),
                        rs.getString("dateBred"),
                        rs.getString("dueDate"),
                        rs.getString("treatmentDate")
                ));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        table.setItems(goats);
        table.setStyle("-fx-font-size: 20px; -fx-table-cell-border-color: black;");
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        AnchorPane textButtons = new AnchorPane();

        Text back = backButton();
        back.setOnMouseClicked(
                b -> {
                    mainMenu(stage);
                }
        );

        Text exit = exitButton();
        exit.setOnMouseClicked(
                x -> {
                    Platform.exit();
                }
        );

        Text menu = menuButton();
        menu.setOnMouseClicked(c -> {settings(stage);});

        Button save = new Button("Save");
        save.setFont(buttonFont);
        save.setOnAction(a -> {save(stage);});

        VBox root = new VBox(table, save);
        root.setStyle("-fx-background-color:#efd096;");
        root.setSpacing(stage.getScene().getHeight() *0.007);

        textButtons.setPickOnBounds(false);

        AnchorPane.setTopAnchor(back, 25.0);
        AnchorPane.setLeftAnchor(back, 25.0);

        AnchorPane.setTopAnchor(exit, 25.0);
        AnchorPane.setRightAnchor(exit, 25.0);

        root.setAlignment(Pos.CENTER);
        textButtons.getChildren().addAll(back, exit);

        root.getChildren().add(textButtons);
        textButtons.toBack();

        Scene scene = stage.getScene();
        scene.setRoot(root);

        root.setPadding(new Insets(scene.getWidth() * 0.02));
    }

    public static void modifyEntry(Stage stage) {
        StackPane root = new StackPane();
        VBox items = new VBox();
        HBox prompts = new HBox();
        HBox buttons = new HBox();
        AnchorPane overlay = new AnchorPane();

        BackgroundImage backgroundImage = getBackgroundImage();

        root.setBackground(new Background(backgroundImage));

        Text back = backButton();
        back.setOnMouseClicked(b -> {mainMenu(stage);});

        Text exit = exitButton();
        exit.setOnMouseClicked(x -> {Platform.exit();});

        Text menu = menuButton();
        menu.setOnMouseClicked(c -> {settings(stage);});

        AnchorPane.setBottomAnchor(menu, 50.0);
        AnchorPane.setLeftAnchor(menu, 50.0);

        AnchorPane.setTopAnchor(back, 50.0);
        AnchorPane.setLeftAnchor(back, 50.0);

        AnchorPane.setTopAnchor(exit, 50.0);
        AnchorPane.setRightAnchor(exit, 50.0);

        overlay.setPickOnBounds(false);

        Text header = new Text("\uD83D\uDC10 Modify Entry \uD83D\uDC10");
        header.setFont(headerFont2);
        header.setUnderline(true);

        Text prompt = new Text("Select a goat to modify:");
        prompt.setFont(captionFont2);

        ComboBox<String> choices = new ComboBox<>();
        choices.getItems().addAll(getGoatNames());
        choices.setStyle("-fx-font-family: Palatino Linotype; -fx-font-size: 20");

        Button confirm = new Button("Confirm");
        confirm.setFont(buttonFont);

        prompts.getChildren().addAll(prompt, choices);
        buttons.getChildren().add(confirm);
        overlay.getChildren().addAll(back, exit, menu);
        items.getChildren().addAll(header, prompts, buttons);
        root.getChildren().addAll(items, overlay);

        prompts.setAlignment(Pos.CENTER);
        buttons.setAlignment(Pos.CENTER);
        items.setAlignment(Pos.CENTER);
        root.setAlignment(Pos.CENTER);

        Scene scene = stage.getScene();
        scene.setRoot(root);

        prompts.setSpacing(scene.getWidth() * 0.007);
        items.setSpacing(scene.getWidth() * 0.02);

        confirm.setOnAction(
                e -> {
                    if (choices.getValue() != null)
                        addGoat(stage, getGoat(stage, choices.getValue()));
                }
        );
    }

    public static void deleteEntry(Stage stage) {
        StackPane root = new StackPane();
        VBox items = new VBox();
        HBox prompts = new HBox();
        HBox buttons = new HBox();
        AnchorPane textButtons = new AnchorPane();

        BackgroundImage backgroundImage = getBackgroundImage();

        root.setBackground(new Background(backgroundImage));

        Text back = backButton();
        back.setOnMouseClicked(
                b -> {
                    mainMenu(stage);
                }
        );

        Text exit = exitButton();
        exit.setOnMouseClicked(
                x -> {
                    Platform.exit();
                }
        );

        Text menu = menuButton();
        menu.setOnMouseClicked(c -> {settings(stage);});

        textButtons.setPickOnBounds(false);

        AnchorPane.setBottomAnchor(menu, 50.0);
        AnchorPane.setLeftAnchor(menu, 50.0);

        AnchorPane.setTopAnchor(back, 50.0);
        AnchorPane.setLeftAnchor(back, 50.0);

        AnchorPane.setTopAnchor(exit, 50.0);
        AnchorPane.setRightAnchor(exit, 50.0);

        Text header = new Text("\uD83D\uDC10 Delete Entry \uD83D\uDC10");
        header.setFont(headerFont2);
        header.setUnderline(true);

        Text choose = new Text("Choose a goat:");
        choose.setFont(captionFont);

        ComboBox<String> names = new ComboBox<>();
        names.getItems().addAll(getGoatNames());
        names.setStyle("-fx-font-family: Palatino Linotype; -fx-font-size: 20");

        Button view = new Button("View");
        Button delete = new Button("Delete");

        view.setFont(buttonFont);
        delete.setFont(buttonFont);

        prompts.getChildren().addAll(choose, names);
        buttons.getChildren().addAll(delete, view);
        items.getChildren().addAll(header, prompts, buttons);
        textButtons.getChildren().addAll(back, exit, menu);
        root.getChildren().addAll(items, textButtons);

        prompts.setAlignment(Pos.CENTER);
        buttons.setAlignment(Pos.CENTER);
        items.setAlignment(Pos.CENTER);
        root.setAlignment(Pos.CENTER);

        Scene scene = stage.getScene();
        scene.setRoot(root);

        prompts.setSpacing(scene.getWidth() * 0.007);
        buttons.setSpacing(scene.getWidth() * 0.005);
        items.setSpacing(scene.getWidth() * 0.02);

        delete.setOnAction(
                d -> {
                    if (names.getValue() != null)
                        areYouSure(stage, names.getValue());
                    else
                        deleteEntry(stage);
                }
        );

        view.setOnAction(
                v -> {
                    if (names.getValue() != null)
                        viewEntry(stage, getGoat(stage, names.getValue()), false);
                    else
                        deleteEntry(stage);
                }
        );
    }

    public static void viewEntry(Stage stage, List<String> data, boolean tableView) {
        StackPane root = new StackPane();
        VBox items = new VBox();
        HBox buttons = new HBox();
        AnchorPane textButtons = new AnchorPane();

        BackgroundImage backgroundImage = getBackgroundImage();

        root.setBackground(new Background(backgroundImage));

        Text back = backButton();
        if (!tableView)
            back.setOnMouseClicked(b -> {deleteEntry(stage);});
        else
            back.setOnMouseClicked(b -> {displayTable(stage);});

        Text exit = exitButton();
        exit.setOnMouseClicked(x -> {Platform.exit();});

        Text menu = menuButton();
        menu.setOnMouseClicked(c -> {settings(stage);});

        textButtons.setPickOnBounds(false);

        AnchorPane.setBottomAnchor(menu, 50.0);
        AnchorPane.setLeftAnchor(menu, 50.0);

        AnchorPane.setTopAnchor(back, 50.0);
        AnchorPane.setLeftAnchor(back, 50.0);

        AnchorPane.setTopAnchor(exit, 50.0);
        AnchorPane.setRightAnchor(exit, 50.0);

        Text title = new Text("\uD83D\uDC10 View goat \uD83D\uDC10");
        title.setFont(headerFont2);
        title.setUnderline(true);

        Text name = new Text(String.format("Name: %s", data.get(0)));
        name.setFont(captionFont2);

        Text weight = new Text(String.format("Weight: %s lbs", data.get(1)));
        weight.setFont(captionFont2);

        Text dob = new Text(String.format("DOB: %s", data.get(2)));
        dob.setFont(captionFont2);

        Text dop = new Text(String.format("DOP: %s", data.get(3)));
        dop.setFont(captionFont2);

        String wrapped = data.get(4).replaceAll("(.{50})", "$1\n");
        Text meds = new Text(String.format("Meds: %s", wrapped));
        meds.setFont(captionFont2);

        Text vacc = new Text(String.format("Vaccinations: %s", data.get(5)));
        vacc.setFont(captionFont2);

        Text trimDate = new Text(String.format("Trim Date: %s", data.get(6)));
        trimDate.setFont(captionFont2);

        Text dateBred = new Text(String.format("Date Bred: %s", data.get(7)));
        dateBred.setFont(captionFont2);

        Text dueDate = new Text(String.format("Due Date: %s", data.get(8)));
        dueDate.setFont(captionFont2);

        Text treatmentDate = new Text(String.format("Treatment Date: %s", data.get(9)));
        treatmentDate.setFont(captionFont2);

        if (!tableView) {
            Button delete = new Button("Delete");
            delete.setFont(buttonFont);

            Button cancel = new Button("Cancel");
            cancel.setFont(buttonFont);

            buttons.getChildren().addAll(delete, cancel);
            items.getChildren().addAll(title, name, weight, dob, dop, meds, vacc, trimDate, dateBred, dueDate, treatmentDate, buttons);
            textButtons.getChildren().addAll(back, exit, menu);
            root.getChildren().addAll(items, textButtons);

            buttons.setAlignment(Pos.CENTER);
            items.setAlignment(Pos.CENTER);
            root.setAlignment(Pos.CENTER);

            Scene scene = stage.getScene();
            scene.setRoot(root);

            buttons.setSpacing(scene.getWidth() * 0.007);
            items.setSpacing(scene.getHeight() * 0.02);

            delete.setOnAction(
                    d -> {
                        areYouSure(stage, data.get(0));
                    }
            );

            cancel.setOnAction(
                    e -> {
                        deleteEntry(stage);
                    }
            );
        } else {
            Button modify = new Button("Modify");
            modify.setFont(buttonFont);

            Button delete = new Button("Delete");
            delete.setFont(buttonFont);

            Button cancel = new Button("Cancel");
            cancel.setFont(buttonFont);

            buttons.getChildren().addAll(modify, delete, cancel);
            items.getChildren().addAll(title, name, weight, dob, dop, meds, vacc, trimDate, dateBred, dueDate, treatmentDate, buttons);
            textButtons.getChildren().addAll(back, exit, menu);
            root.getChildren().addAll(items, textButtons);

            buttons.setAlignment(Pos.CENTER);
            items.setAlignment(Pos.CENTER);
            root.setAlignment(Pos.CENTER);

            Scene scene = stage.getScene();
            scene.setRoot(root);

            buttons.setSpacing(scene.getWidth() * 0.007);
            items.setSpacing(scene.getHeight() * 0.02);

            modify.setOnAction(
                    m -> {
                        addGoat(stage, data);
                    }
            );

            delete.setOnAction(
                    d -> {
                        areYouSure(stage, data.get(0));
                    }
            );

            cancel.setOnAction(
                    e -> {
                        displayTable(stage);
                    }
            );
        }
    }

    public static void settings(Stage stage) {
        StackPane root = new StackPane();
        VBox items = new VBox();

        root.setStyle("-fx-background-color:#efd096;");

        Text header = new Text("Navigation Menu");
        header.setFont(headerFont2);
        header.setUnderline(true);

        Button add = new Button("Add Goat");
        add.setFont(buttonFont);

        Button modify = new Button("Modify Entry");
        modify.setFont(buttonFont);

        Button view = new Button("Display Table");
        view.setFont(buttonFont);

        Button delete = new Button("Delete Entry");
        delete.setFont(buttonFont);

        Button save = new Button("Save Data");
        save.setFont(buttonFont);

        items.getChildren().addAll(header, add, modify, view, delete, save);
        root.getChildren().addAll(items);

        items.setAlignment(Pos.CENTER);
        root.setAlignment(Pos.CENTER);

        Scene scene = new Scene(root, stage.getScene().getWidth() * 0.5, stage.getScene().getHeight() * 0.4);

        items.setSpacing(scene.getHeight() * 0.03);

        Stage popUpStage = new Stage();
        popUpStage.setTitle("Navigation");
        popUpStage.setScene(scene);
        popUpStage.initOwner(stage);
        popUpStage.initModality(Modality.WINDOW_MODAL);
        popUpStage.show();

        add.setOnAction(
                a -> {
                    popUpStage.close();
                    addGoat(stage);
                }
        );

        modify.setOnAction(
                m -> {
                    popUpStage.close();
                    modifyEntry(stage);
                }
        );

        view.setOnAction(
                v -> {
                    popUpStage.close();
                    displayTable(stage);
                }
        );

        delete.setOnAction(
                d -> {
                    popUpStage.close();
                    deleteEntry(stage);
                }
        );

        save.setOnAction(
                s -> {
                    popUpStage.close();
                    save(stage);
                }
        );
    }

    public static void save(Stage stage) {
        String dbPath = "GOAT_RECORDS.db";

        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Save Database");
        String timestamp = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        fileChooser.setInitialFileName("goat_records_backup_" + timestamp + ".db");
        fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Database Files", "*.db"));

        File destFile = fileChooser.showSaveDialog(stage);

        if (destFile != null) {
            try {
                // Copy the DB file to the chosen location
                Files.copy(Paths.get(dbPath), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

                // Success popup
                Alert alert = new Alert(Alert.AlertType.INFORMATION);
                alert.setTitle("Backup Complete");
                alert.setHeaderText(null);
                alert.setContentText("Database successfully saved to:\n" + destFile.getAbsolutePath());
                alert.showAndWait();

            } catch (IOException e) {
                // Error popup
                Alert errorAlert = new Alert(Alert.AlertType.ERROR);
                errorAlert.setTitle("Backup Failed");
                errorAlert.setHeaderText("Could not save database.");
                errorAlert.setContentText(e.getMessage());
                errorAlert.showAndWait();
            }
        }
    }

    public static Connection connect(String url) {
        try {
            return DriverManager.getConnection(url);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    //done
    public static void addToDB(Stage stage, String name, String weight, String dob, String dop, String meds, String vaccinations, String lastTrim, String breedDate, String dueDate, String treatmentDate) {
        String url = "jdbc:sqlite:GOAT_RECORDS.db";

        try (Connection conn = connect(url)) {
            String create = "CREATE TABLE IF NOT EXISTS GOAT_RECORDS (id INTEGER PRIMARY KEY, name TEXT, weight TEXT, DOB TEXT, DOP TEXT, meds TEXT, vaccinations TEXT, dateTrimmed TEXT, dateBred TEXT, dueDate TEXT, treatmentDate TEXT)";

            String insert = "INSERT INTO GOAT_RECORDS (name, weight, DOB, DOP, meds, vaccinations, dateTrimmed, dateBred, dueDate, treatmentDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            assert conn != null;
            Statement createTable = conn.createStatement();

            createTable.execute(create);

            PreparedStatement pstmt = conn.prepareStatement(insert);
            pstmt.setString(1, name);
            pstmt.setString(2, weight);
            pstmt.setString(3, dob);
            pstmt.setString(4, dop);
            pstmt.setString(5, meds);
            pstmt.setString(6, vaccinations);
            pstmt.setString(7, lastTrim);
            pstmt.setString(8, breedDate);
            pstmt.setString(9, dueDate);
            pstmt.setString(10, treatmentDate);
            pstmt.executeUpdate();

            success(stage, "Successfully updated database");

        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    public static void deleteFromDB(Stage stage, String name, boolean condition) {
        String url = "jdbc:sqlite:GOAT_RECORDS.db";
        String sql = "DELETE FROM GOAT_RECORDS WHERE name = ?";

        try (Connection conn = connect(url);
             PreparedStatement pstmt = conn.prepareStatement(sql);) {

            pstmt.setString(1, name);
            int deleted = pstmt.executeUpdate();

            if (deleted > 0 && condition)
                success(stage, "Goat successfully deleted from database");
        } catch (SQLException e) {
            dbError(stage);
        }
    }

    public static void success(Stage stage, String msg) {
        StackPane root = new StackPane();
        VBox items = new VBox();

        root.setStyle("-fx-background-color:#efd096;");

        Text confirmation = new Text(msg);
        confirmation.setFont(captionFont2);

        Button ok = new Button("OK");
        ok.setFont(buttonFont);

        items.getChildren().addAll(confirmation, ok);
        root.getChildren().add(items);

        items.setAlignment(Pos.CENTER);
        root.setAlignment(Pos.CENTER);

        Scene scene = new Scene(root, stage.getScene().getWidth() * 0.3, stage.getScene().getHeight() * 0.2);

        items.setSpacing(scene.getHeight() * 0.05);

        Stage successStage = new Stage();
        successStage.initOwner(stage);
        successStage.initModality(Modality.WINDOW_MODAL);
        successStage.setOnCloseRequest(Event::consume);
        successStage.setTitle("Confirmation");
        successStage.setScene(scene);
        successStage.show();

        ok.setOnAction(
                e -> {
                    mainMenu(stage);
                    successStage.close();
                }
        );
    }

    public static void dbError(Stage stage) {
        StackPane root = new StackPane();
        VBox items = new VBox();

        root.setStyle("-fx-background-color:#efd096;");

        Text error = new Text("Something went wrong, try again");
        error.setFont(captionFont2);

        Button ok = new Button("OK");
        ok.setFont(buttonFont);

        items.getChildren().addAll(error, ok);
        root.getChildren().add(items);

        items.setAlignment(Pos.CENTER);
        root.setAlignment(Pos.CENTER);

        Scene scene = new Scene(root, stage.getScene().getHeight() * 0.4, stage.getScene().getWidth() * 0.2);

        items.setSpacing(scene.getHeight() * 0.05);

        Stage errorStage = new Stage();
        errorStage.initOwner(stage);
        errorStage.initModality(Modality.WINDOW_MODAL);
        errorStage.setOnCloseRequest(Event::consume);
        errorStage.setTitle("Confirmation");
        errorStage.setScene(scene);
        errorStage.show();

        ok.setOnAction(
                e -> {
                    mainMenu(stage);
                    errorStage.close();
                }
        );
    }

    public static void areYouSure(Stage stage, String name) {
        StackPane root = new StackPane();
        VBox items = new VBox();
        HBox buttons = new HBox();

        root.setStyle("-fx-background-color:#efd096;");

        Text confirmation = new Text("Are you sure?");
        confirmation.setFont(captionFont2);

        Button confirm = new Button("Confirm");
        confirm.setFont(buttonFont);

        Button cancel = new Button("Cancel");
        cancel.setFont(buttonFont);

        buttons.getChildren().addAll(confirm, cancel);
        items.getChildren().addAll(confirmation, buttons);
        root.getChildren().add(items);

        buttons.setAlignment(Pos.CENTER);
        items.setAlignment(Pos.CENTER);
        root.setAlignment(Pos.CENTER);

        Scene scene = new Scene(root, stage.getScene().getHeight() * 0.4, stage.getScene().getWidth() * 0.2);

        buttons.setSpacing(scene.getHeight() * 0.05);
        items.setSpacing(scene.getHeight() * 0.05);

        Stage successStage = new Stage();
        successStage.initOwner(stage);
        successStage.initModality(Modality.WINDOW_MODAL);
        successStage.setOnCloseRequest(Event::consume);
        successStage.setTitle("Confirmation");
        successStage.setScene(scene);
        successStage.show();

        confirm.setOnAction(
                d -> {
                    successStage.close();
                    deleteFromDB(stage, name, true);
                }
        );

        cancel.setOnAction(
                c -> {
                    successStage.close();
                    success(stage, "Entry was not deleted");
                }
        );
    }

    public static List<String> getGoatNames() {
        List<String> names = new ArrayList<>();

        String url = "jdbc:sqlite:GOAT_RECORDS.db";

        try (Connection conn = connect(url)) {
            String query = "SELECT name FROM GOAT_RECORDS";

            assert conn != null;
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);

            while(rs.next()) {
                String name = rs.getString("name");
                names.add(name);
            }

            Collections.sort(names);

            return names;
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return null;
    }

    public static List<String> getGoat(Stage stage, String name) {
        List<String> data = new ArrayList<>();

        String url = "jdbc:sqlite:GOAT_RECORDS.db";
        String query = "SELECT * FROM GOAT_RECORDS WHERE name = ?";

        try (Connection conn = connect(url);
             PreparedStatement pstmt = conn.prepareStatement(query);) {

            pstmt.setString(1, name);

            try(ResultSet rs = pstmt.executeQuery()) {

                ResultSetMetaData meta = rs.getMetaData();
                int columnCount = meta.getColumnCount();

                if (rs.next()) {
                    for (int i = 2; i <= columnCount; i++) {
                        data.add(rs.getString(i));
                    }
                }
            }

            return data;

        } catch (SQLException e) {
            dbError(stage);
            return Collections.emptyList();
        }
    }

    public static Text backButton() {
        Text back = new Text("🔙");
        back.setFont(Font.font("Segoe UI Symbol", 50));

        //Mouse hover effects
        back.setOnMouseEntered(e -> entryHovered(back));
        back.setOnMouseExited(e -> entryExited(back));

        return back;
    }

    public static Text exitButton() {
        Text exit = new Text("✖");
        exit.setFont(Font.font("Segoe UI Symbol", 50));

        //Mouse hover effects
        exit.setOnMouseEntered(e -> entryHovered(exit));
        exit.setOnMouseExited(e -> entryExited(exit));

        return exit;
    }

    public static Text menuButton() {
        Text gear = new Text("☰");
        gear.setFont(Font.font("Segoe UI Symbol", 50));

        gear.setOnMouseEntered(e -> entryHovered(gear));
        gear.setOnMouseExited(e -> entryExited(gear));

        return gear;
    }

    public static void entryHovered(Text entry) {
        entry.setFill(Color.BLUE);
        entry.setUnderline(true);
        entry.setScaleX(1.05);
        entry.setScaleY(1.05);
    }

    //Reverse the changes applied from the entryHovered method when the mouse moves off of the entry.
    public static void entryExited(Text entry) {
        entry.setFill(Color.BLACK);
        entry.setUnderline(false);
        entry.setScaleX(1);
        entry.setScaleY(1);
    }

    public ImageView getBG(String path, Stage stage) {
        ImageView bg = new ImageView(new Image(path));

        bg.setPreserveRatio(false);
        bg.setSmooth(true);
        bg.fitWidthProperty().bind(stage.widthProperty()); //Make fullscreen
        bg.fitHeightProperty().bind(stage.heightProperty());

        return bg;
    }

    public static void main(String[] args) {
        launch();
    }
}