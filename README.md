# My Personal Portfolio Website Deployment (AltSchool Final Exam)

This is a detailed explanation of how I built and deployed my personal portfolio website using an EC2 Ubuntu server on AWS. I also set up a custom domain with HTTPS using Route 53 and Let's Encrypt. This document outlines every step I took, including the problems I faced and how I fixed them.

---
## Table of Contents

- [Tools and Requirements](#tools-and-requirements)
- [Step 1: Launching an Ubuntu EC2 Instance](#step-1-launching-an-ubuntu-ec2-instance)
- [Step 2: Installing Nginx on the Server](#step-2-installing-nginx-on-the-server)
- [Step 3: Creating the Website Files on the Server](#step-3-creating-the-website-files-on-the-server)
- [Step 4: Registering a Domain with Route 53](#step-4-registering-a-domain-with-route-53)
- [Step 5: Connecting the Domain to the Server](#step-5-connecting-the-domain-to-the-server)
- [Step 6: Configuring Nginx with the Correct Server Block](#step-6-configuring-nginx-with-the-correct-server-block)
- [Step 7: Installing SSL with Let’s Encrypt and Certbot](#step-7-installing-ssl-with-lets-encrypt-and-certbot)
- [Step 8: Making the Website Mobile-Responsive](#step-8-making-the-website-mobile-responsive)
- [Step 9: Errors and How I Fixed Them](#step-9-errors-and-how-i-fixed-them)
- [Step 10: Pushing My Code to GitHub](#step-10-pushing-my-code-to-github)
- [Screenshot](#screenshot)
- [Live Site](#live-site)
---

## Tools and Requirements

I used the following tools and services:

AWS EC2 instance running Ubuntu 22.04  
Nginx web server  
GitHub  
Route 53 for domain registration and DNS management  
Let’s Encrypt SSL with Certbot  
A domain name: `ngozi-opara-portfolio.com`

---

## Step 1: Launching an Ubuntu EC2 Instance

I logged into AWS and launched a new EC2 instance.

I selected Ubuntu Server 24.04 as the operating system.  
I chose a t3.micro instance type (eligible for the free tier).  
I created a new key pair to securely access the instance.  
In the security group settings, I allowed inbound traffic on ports 22 (SSH), 80 (HTTP), and 443 (HTTPS). I also ensured outbound access was allowed.

Once the instance was running, I copied the public IPv4 address.

To connect to the instance, I ran:

```bash
ssh -i my-key.pem ubuntu@<public-ip>
```

This command means:

- `ssh`: starts a secure connection to a remote server.  
- `-i my-key.pem`: uses the key I downloaded when setting up the instance.  
- `ubuntu@<public-ip>`: logs into the server as the Ubuntu user.

---

## Step 2: Installing Nginx on the Server

After connecting to the server, I updated the package list and installed Nginx:

```bash
sudo apt update
```

This updates the list of available packages.

```bash
sudo apt install nginx
```

This installs the Nginx web server.

To confirm it worked, I visited the server’s public IP in my browser and saw the default Nginx welcome page.

---

## Step 3: Creating the Website Files on the Server

I did not upload the website files. Instead, I created the HTML, CSS, and JavaScript files manually on the server using the nano editor.

```bash
sudo mv /var/www/html/index.html /var/www/html/idex.html
```

This renamed the default Nginx file to avoid conflict.

```bash
sudo nano /var/www/html/index.html
```

I pasted my HTML code into this file.

```bash
sudo nano /var/www/html/style.css
```

I pasted my CSS code here.

```bash
sudo nano /var/www/html/script.js
```

I pasted my JavaScript code into this file.

---

## Step 4: Registering a Domain with Route 53

I bought a domain name from AWS Route 53.

I created two A records:

One for `ngozi-opara-portfolio.com` pointing to the EC2 public IP.  
Another for `www.ngozi-opara-portfolio.com` pointing to the same IP.

This allows visitors to access the site using both `www` and the root domain.

---

## Step 5: Connecting the Domain to the Server

Once the A records were set, I waited a few minutes for DNS propagation. Then I tested the connection by typing the domain name in the browser. It worked because the DNS records were now correctly pointing to my server's IP address.

Before this worked, I had to make sure the domain name I registered actually matched what the web server was expecting. If the DNS wasn't fully propagated yet, I would have seen a “site not found” or an Nginx error page.

---

## Step 6: Configuring Nginx with the Correct Server Block

To serve content for my domain, I created a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/ngozi-opara-portfolio.com
```

In this file, I added:

```nginx
server {
    listen 80;
    server_name ngozi-opara-portfolio.com www.ngozi-opara-portfolio.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    return 301 https://$host$request_uri;
}
```

This configuration listens on port 80, handles both domain versions, and redirects all HTTP traffic to HTTPS.

Then I created a symbolic link to enable this site:

```bash
sudo ln -s /etc/nginx/sites-available/ngozi-opara-portfolio.com /etc/nginx/sites-enabled/
```

I removed the default config that was causing conflicts:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

To make sure my configuration was correct, I ran:

```bash
sudo nginx -t
```

This checks for syntax errors. Then I reloaded the server:

```bash
sudo systemctl reload nginx
```

---

## Step 7: Installing SSL with Let’s Encrypt and Certbot

I wanted my site to be secure (with HTTPS), so I used Certbot to get an SSL certificate from Let’s Encrypt.

First, I installed the necessary packages:

```bash
sudo apt install certbot python3-certbot-nginx
```

Then I ran:

```bash
sudo certbot --nginx -d ngozi-opara-portfolio.com -d www.ngozi-opara-portfolio.com
```

This command tells Certbot to get a certificate for both versions of my domain and to automatically update the Nginx config to use it.

To make sure the certificates would renew automatically, I tested renewal with:

```bash
sudo certbot renew --dry-run
```

This simulates a certificate renewal without making actual changes.

---

## Step 8: Making the Website Mobile-Responsive

To ensure my website looked good on phones and tablets, I used media queries in the CSS file. These queries change layout and font sizes based on the screen width.

I edited `style.css` and added:

```css
@media (max-width: 768px) {
  .page-wrapper {
    padding: 20px 15px;
    margin: 20px;
  }

  .card-grid {
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 100%;
    max-width: 90%;
  }

  .popup {
    width: 90%;
    max-width: 300px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
```

This made the layout adapt well to smaller screens.

---

## Step 9: Errors and How I Fixed Them

### Problem: Site kept showing the default Nginx page

Fix: I moved the default config out of `sites-enabled`:

```bash
sudo mv /etc/nginx/sites-enabled/default /etc/nginx/default-backup
```

Even though I created a new file for my domain config, Nginx was still reading the default file until I removed it.

### Problem: www version of the site was not loading

Fix: I forgot to create an A record for `www.ngozi-opara-portfolio.com`. After creating that and adding it to the server_name in Nginx, it started working.

### Problem: The popup was not centered

Fix: I updated the popup CSS:

```css
.popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
```

---

## Step 10: Pushing My Code to GitHub

Once everything was working, I wanted to keep a backup and show my code to others. So I created a GitHub repo and pushed my files.

First, I initialized Git:

```bash
git init
```

This sets up a new Git repository in my current directory.

```bash
git remote add origin https://github.com/username/portfolio.git
```

This connects the local project to a remote GitHub repository.

```bash
git add .
```

This stages all my files to be committed.

```bash
git commit -m "Initial commit"
```

This creates a snapshot of the project.

```bash
git branch -M main
```

This renames the current branch to `main`.

```bash
git push -u origin main
```

This pushes the project to GitHub.

---

## Screenshot

![screenshot](./screenshot.png)

---

## Live Site

[https://ngozi-opara-portfolio.com](https://ngozi-opara-portfolio.com)

