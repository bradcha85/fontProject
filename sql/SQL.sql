CREATE TABLE USERS(
USER_NO INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
MAIL VARCHAR(50) NOT NULL,
PASSWORD VARCHAR(100) NOT NULL
);

CREATE TABLE FONTS(
FONT_NO INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
FONT_NAME VARCHAR(50) NOT NULL,
FONT_PRICE VARCHAR(50) NOT NULL,
FONT_SALESRATE INT(20), 
FONT_FILENAME VARCHAR(50), 
FONT_RFILENAME VARCHAR(50)
);

CREATE TABLE CART(
CART_NO INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
USER_NO INT(5),
FONT_NO INT(5),
FOREIGN KEY (USER_NO)
REFERENCES USERS(USER_NO) ON UPDATE CASCADE ON DELETE CASCADE,
FOREIGN KEY (FONT_NO)
REFERENCES FONTS(FONT_NO) ON UPDATE CASCADE ON DELETE CASCADE
);