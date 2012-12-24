package org.umlsync.autotest.filemenu;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.testng.Assert;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Test;
import org.umlsync.autotest.components.EditorFramework;
import org.umlsync.autotest.components.elements.Connector;
import org.umlsync.autotest.components.elements.Diagram;
import org.umlsync.autotest.components.elements.Element;
import org.umlsync.autotest.components.elements.wrappers.ClassWrapper;
import org.umlsync.autotest.selenium.WebJQueryDriverBackedSelenium;

import com.thoughtworks.selenium.Selenium;

public class TestClassDiagram {
	WebDriver driver;
	Selenium selenium;
	EditorFramework editor;
	Diagram classDiagram;

	@BeforeSuite
	public void startSelenium() {
		driver = new FirefoxDriver();
		selenium = new WebJQueryDriverBackedSelenium(driver, AutomatedTestConfiguration.EDITOR_BASE_URL);

		editor = new EditorFramework();
		editor.init(selenium, driver);
		editor.Maximize();

		// Open the page and skip first dialogs
		selenium.open(AutomatedTestConfiguration.EDITOR_URL);
		editor.GetDialogManager().CancelAll();
		classDiagram = editor.GetDiagramManager().CreateDiagram("UML class diagram", "TestClassDiagram");
		Assert.assertEquals(editor.GetDiagramManager().IsDiagramActive(classDiagram), true);
	}

	@AfterSuite
	public void stopSelenium() {
		driver.close();
	}

	@Test
	public void testClassDiagram_EditableTitle() {
		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		classElement.setTitle("TestEditable");
		Assert.assertEquals(classElement.getTitle().equals("TestEditable"), true);

		classElement.setTitle("TestEditable2");
		Assert.assertEquals(classElement.getTitle().equals("TestEditable2"), true);
	}

	@Test
	public void testClassDiagram_EditableFields() {

		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();
		int h0 = classElement.getFieldsAreaHeight().intValue();

		classElement.addField("(+) int field1");
		int h1 = classElement.getFieldsAreaHeight().intValue();
		Assert.assertEquals(h0 ==h1, true);

		classElement.addField("(+) int field2");
		int h2 = classElement.getFieldsAreaHeight().intValue();
		Assert.assertEquals(h2 > h1, true); // Check auto field increase

		classElement.addField("(+) int field3");
		int h3 = classElement.getFieldsAreaHeight().intValue();
		Assert.assertEquals(h3 > h2, true);
		classElement.sortFields(1, 2);
		String val = classElement.getFieldByIndex(2);
		Assert.assertNotNull(val);
		Assert.assertEquals(val.contains("field2"), true);

		classElement.sortFields(2, 1);
		val = classElement.getFieldByIndex(2);
		Assert.assertNotNull(val);
		Assert.assertEquals(val.contains("field3"), true);

		classElement.sortFields(2, 0);
		val = classElement.getFieldByIndex(2);
		Assert.assertNotNull(val);
		Assert.assertEquals(val.contains("field2"), true);

		classElement.addMethod("(+) bool getField1()");
		classElement.addMethod("(+) bool getField2()");
		classElement.addMethod("(+) bool getField3()");

		classElement.sortMethods(1, 2);
		val = classElement.getMethodByIndex(2);
		Assert.assertNotNull(val);
		Assert.assertEquals(val.contains("Field2"), true);

		classElement.sortMethods(2, 1);
		val = classElement.getMethodByIndex(2);
		Assert.assertNotNull(val);
		Assert.assertEquals(val.contains("Field3"), true);

		classElement.sortMethods(2, 0);
		val = classElement.getMethodByIndex(2);
		Assert.assertNotNull(val);
		Assert.assertEquals(val.contains("Field2"), true);

		int h = classElement.getFieldsAreaHeight().intValue();
		classElement.ResizeFieldsArea(40);
		h2 = classElement.getFieldsAreaHeight().intValue();
		Assert.assertEquals(h2 >= h + 40, true);

		classElement.ResizeFieldsArea(-40);
		h2 = classElement.getFieldsAreaHeight().intValue();
		Assert.assertEquals(h2 == h, true);
	}

	/*
	 * Test:
	 * create class
	 * change name
	 * add field and rename X3
	 * sort fields x3
	 * add method and rename x3
	 * sort fields x3
	 * revert all items above
	 */
	@Test
	public void testClassDiagram_OperationManager() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();
		String title = classElement.getTitle();

		// Set title
		classElement.setTitle("TestEditable");
		Assert.assertEquals(classElement.getTitle().equals("TestEditable"), true);

		int fieldsHeight = classElement.getFieldsAreaHeight().intValue();

		classElement.addField("(+) int field1"); // Keep fields area size (2 operations add and edit)
		classElement.addField("(+) int field2"); // Increase fields area size
		int fieldsHeight2 = classElement.getFieldsAreaHeight().intValue();

		classElement.sortFields(0, 1); // Check both sort direction
		classElement.sortFields(1, 0);


		int methodsHeight0 = classElement.getMethodsAreaHeight().intValue();
		classElement.addMethod("(+) bool getField1()");
		int methodsHeight1 = classElement.getMethodsAreaHeight().intValue();
		classElement.addMethod("(+) bool getField2()");
		int methodsHeight2 = classElement.getMethodsAreaHeight().intValue();

		classElement.sortMethods(0, 1);
		classElement.sortMethods(1, 0);


		Assert.assertEquals(classElement.getMethodByIndex(1).contains("Field2"), true);

		classDiagram.GetKeyHandler().Revert();
		Assert.assertEquals(classElement.getMethodByIndex(1).contains("Field1"), true);

		classDiagram.GetKeyHandler().Revert();
		Assert.assertEquals(classElement.getMethodByIndex(1).contains("Field2"), true);

		classDiagram.GetKeyHandler().Revert();
		classDiagram.GetKeyHandler().Revert();
		int mh = classElement.getMethodsAreaHeight().intValue();
		Assert.assertEquals(mh == methodsHeight1, true);

		classDiagram.GetKeyHandler().Revert();
		classDiagram.GetKeyHandler().Revert();
		mh = classElement.getMethodsAreaHeight().intValue();
		Assert.assertEquals(mh == methodsHeight0, true);

		Assert.assertEquals(classElement.getFieldByIndex(1).contains("field2"), true);
		classDiagram.GetKeyHandler().Revert();
		Assert.assertEquals(classElement.getFieldByIndex(1).contains("field1"), true);
		classDiagram.GetKeyHandler().Revert();
		Assert.assertEquals(classElement.getFieldByIndex(1).contains("field2"), true);

		classDiagram.GetKeyHandler().Revert();
		classDiagram.GetKeyHandler().Revert();
		mh = classElement.getFieldsAreaHeight().intValue();
		Assert.assertEquals(mh == fieldsHeight, true);

		Assert.assertEquals(classElement.getMethods() == null, true);

		classDiagram.GetKeyHandler().Revert();
		classDiagram.GetKeyHandler().Revert();
		mh = classElement.getFieldsAreaHeight().intValue();
		Assert.assertEquals(mh == fieldsHeight, true);

		Assert.assertEquals(classElement.getFields() == null, true);

		classDiagram.GetKeyHandler().Revert();
		Assert.assertEquals(classElement.getTitle().equals("TestEditable"), false);
	}

	/*
	 * Test:
	 * create class
	 * change name
	 * add field and rename X3
	 * sort fields x3
	 * add method and rename x3
	 * sort fields x3
	 * revert all items above
	 */
	@Test
	public void testClassDiagram_OperationManagerImproved() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		// Set title
		classElement.setTitle("TestEditable");
		Assert.assertEquals(classElement.getTitle().equals("TestEditable"), true);


		classElement.addField("(+) int field1"); // Keep fields area size (2 operations add and edit)
		classElement.addField("(+) int field2"); // Increase fields area size

		classElement.sortFields(0, 1); // Check both sort direction
		classElement.sortFields(1, 0);


		classElement.addMethod("(+) bool getField1()");
		classElement.addMethod("(+) bool getField2()");

		classElement.sortMethods(0, 1);
		classElement.sortMethods(1, 0);

		Assert.assertTrue(classDiagram.GetOperationManager().RevertOperation(13));
		Assert.assertTrue(classDiagram.GetOperationManager().RepeatOperation(13));
	}		


	@Test
	public void testClassDiagram_OperationManager2() {
		classDiagram.GetKeyHandler().RemoveAll();

		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();

		Dimension dim = classElement.Dimention();
		int fh = classElement.getFieldsAreaHeight().intValue();
		int mh = classElement.getMethodsAreaHeight().intValue();

		classElement.Resize("se-u", "+10,+20");
		Dimension dim2 = classElement.Dimention();
		int fh2 = classElement.getFieldsAreaHeight().intValue();
		int mh2 = classElement.getMethodsAreaHeight().intValue();


		Assert.assertEquals(dim2.height == dim.height+20, true);
		Assert.assertEquals(dim2.width == dim.width+10, true);

		classElement.ResizeFieldsArea(30);
		Dimension dim3 = classElement.Dimention();
		Assert.assertEquals(dim3.height == dim2.height+30, true);
		int fh3 = classElement.getFieldsAreaHeight().intValue();
		int mh3 = classElement.getMethodsAreaHeight().intValue();

		classDiagram.GetKeyHandler().Revert();
		Dimension dim_tmp = classElement.Dimention();
		int fh_tmp = classElement.getFieldsAreaHeight().intValue();
		int mh_tmp = classElement.getMethodsAreaHeight().intValue();

		Assert.assertEquals(dim_tmp.height == dim2.height, true);
		Assert.assertEquals(fh_tmp == fh2, true);
		Assert.assertEquals(mh_tmp == mh2, true);

		classDiagram.GetKeyHandler().Revert();
		dim_tmp = classElement.Dimention();
		fh_tmp = classElement.getFieldsAreaHeight().intValue();
		mh_tmp = classElement.getMethodsAreaHeight().intValue();

		Assert.assertEquals(dim_tmp.height == dim.height, true);
		Assert.assertEquals(fh_tmp == fh, true);
		Assert.assertEquals(mh_tmp == mh, true);

		classDiagram.GetKeyHandler().Repeat();
		dim_tmp = classElement.Dimention();
		fh_tmp = classElement.getFieldsAreaHeight().intValue();
		mh_tmp = classElement.getMethodsAreaHeight().intValue();

		Assert.assertEquals(dim_tmp.height == dim2.height, true);
		Assert.assertEquals(fh_tmp == fh2, true);
		Assert.assertEquals(mh_tmp == mh2, true);

		classDiagram.GetKeyHandler().Repeat();
		dim_tmp = classElement.Dimention();
		fh_tmp = classElement.getFieldsAreaHeight().intValue();
		mh_tmp = classElement.getMethodsAreaHeight().intValue();

		Assert.assertEquals(dim_tmp.height == dim3.height, true);
		Assert.assertEquals(fh_tmp == fh3, true);
		Assert.assertEquals(mh_tmp == mh3, true);
	}

	@Test
	public void testClassDiagram_OperationManager3() {
		classDiagram.GetKeyHandler().RemoveAll();
		Element element = classDiagram.CreateElement("Class", "FirstClass");
		Assert.assertEquals(element != null, true);

		ClassWrapper classElement = (ClassWrapper) element.GetElementWrapper();
		classElement.Select();
		classDiagram.GetIconMenuHandler().dragAndDrop(element, "aggregation", 310, 0);

		Element element2 = classDiagram.IdentifyNewElement("Class");

		Connector con1 = classDiagram.IdentifyNewConnector();

		con1.AddEpointByIndex(0, 100, 100);
		con1.AddEpointByIndex(1, 100, 100);
		con1.AddEpointByIndex(2, -100, 100);
		con1.AddEpointByIndex(1, +300, -200);
		con1.AddEpointByIndex(1, +100, +200);
		con1.AddEpointByIndex(1, -300, +200);
	}
}
