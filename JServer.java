package amap.faas.demo;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.lang.Thread;
import java.net.ServerSocket;
import java.net.Socket;

import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.http.HttpResponse;
import org.apache.commons.codec.binary.Base64;

public class JServer {    
    private ServerSocket s;
    
    public JServer(int port) {
        try {
            s = new ServerSocket(port);
        } catch(IOException ioe) {}
        while (true) {
            Socket c = null;
            try {
                c = s.accept();
            } catch(IOException ioe) {}
            new Handler(c).start();
        }
    }

    private class Handler extends Thread {
        private Socket sock;

        public Handler (Socket c) {
            sock = c;
        }
        
        public void run () {
            try {                
                InputStream is = sock.getInputStream();
                InputStreamReader isr = new InputStreamReader(is);
                BufferedReader br = new BufferedReader(isr);
                
                OutputStream os = sock.getOutputStream();
                OutputStreamWriter osw = new OutputStreamWriter(os);
                BufferedWriter bw = new BufferedWriter(osw); 
                
                String command[] = br.readLine().split("\\s+");
                if (3 == command.length && "GET".equals(command[0])) {
                    System.out.printf("GET %s\n", command[1]);
                    String path = command[1];

                    String strResult = "succ";
                    String type = "text/plain";
                    bw.write("HTTP/1.0 200 Ok");
                    bw.newLine();
                    bw.write(String.format("Content-Type: %s", type));
                    bw.newLine();
                    bw.write(String.format("Content-Length: %d", strResult.length()));
                    bw.newLine(); 
                    bw.write(String.format("Access-Control-Allow-Origin: *"));
                    bw.newLine();
                    bw.newLine();
                    bw.write(strResult);
                    bw.flush();
                } else {
                    bw.write("HTTP/1.1 400 Bad Request");
                    bw.newLine();
                    bw.write(String.format("Access-Control-Allow-Origin: *"));
                    bw.newLine();
                    bw.newLine();
                    bw.write("arg num is not right");
                    bw.flush();
                }
            } catch(IOException ioe) {
                ioe.printStackTrace();  
            }
            try {
                sock.close();
            } catch(IOException ioe) {
                ioe.printStackTrace();  
            }
        }
    }

    public static void main (String args[]) {
        System.out.println("JServer started!");
        new JServer(80);
    }
}
