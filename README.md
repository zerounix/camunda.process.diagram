Processdiagram cookbook – or howto write your own highly customizable process diagram with almost now effort
=======================

Camunda recently released their great process sharing tool camunda Share 
(Camunda Share - camunda.org/share, http://blog.camunda.org/2013/09/camunda-share-discuss-your-bpmn-20.html). 
What a great addition to their stack - we thought - and how cool it would be to be able to visualize or processes 
with or own process diagram. But we want it to be customizable. We would like to show the information we consider 
important for our users.

Source

```java
public enum DatabaseDialect {
  ORACLE("org.hibernate.dialect.Oracle10gDialect"), 
  MYSQL("org.hibernate.dialect.MySQLDialect"), 
  HSQL("org.hibernate.dialect.HSQLDialect");

  private String dialectClass;

  private DatabaseDialect(String dialectClass) {
    this.dialectClass = dialectClass;
  }

  public String getDialectClass() {
    return dialectClass;
  }
}

```