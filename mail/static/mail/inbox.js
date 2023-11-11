document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#send').addEventListener('click', send_email);

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mails(emails) {
  emails.forEach(email =>{
    
    let shortEmail = document.createElement("div"); //create div for short email view
    shortEmail.classList.add("border", "border-3", "short-email", "m-2"); //bootstrap classes
    let sender = document.createElement("p");
    sender.innerHTML = `${email.sender}`;
    sender.classList.add("m-2");
    let subject = document.createElement("p");
    subject.innerHTML = `${email.subject}`;
    subject.classList.add("m-2");
    let timestamp = document.createElement("p");
    timestamp.innerHTML = `${email.timestamp}`// create <p>'s with email content
    timestamp.classList.add("m-2","float-end");
    shortEmail.appendChild(sender);
    shortEmail.appendChild(subject);
    shortEmail.appendChild(timestamp); // add elements to short mail div
    document.getElementById('emails-view').appendChild(shortEmail); // add everything to DOM

  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);  

    load_mails(emails);
    });
}

function send_email() {
  fetch('emails',{
    method : "POST",
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector("#compose-body").value 
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
  });
  load_mailbox('sent');
}