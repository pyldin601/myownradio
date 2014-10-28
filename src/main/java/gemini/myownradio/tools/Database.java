package gemini.myownradio.tools;

import com.mchange.v2.c3p0.ComboPooledDataSource;

import javax.sql.DataSource;
import java.beans.PropertyVetoException;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Created by Roman on 30.09.14.
 */
public class Database {

    final private static DataSource dataSource;

    static {
        try {
            ComboPooledDataSource cpds = new ComboPooledDataSource();

            cpds.setDriverClass("com.mysql.jdbc.Driver");
            cpds.setJdbcUrl(String.format("jdbc:mysql://%s:3306/%s",
                    MORConfig.getRoot().getChild("database").getChild("hostname").getValue(),
                    MORConfig.getRoot().getChild("database").getChild("database").getValue()));

            cpds.setUser(MORConfig.getRoot().getChild("database").getChild("login").getValue());
            cpds.setPassword(MORConfig.getRoot().getChild("database").getChild("password").getValue());

            cpds.setMinPoolSize(1);
            cpds.setAcquireIncrement(1);
            cpds.setMaxPoolSize(20);
            cpds.setMaxIdleTime(60);

            dataSource = cpds;
        } catch (PropertyVetoException e) {
            throw new RuntimeException(e);
        }
    }

    public static Connection newConnection() throws SQLException {
        return dataSource.getConnection();
    }

}

