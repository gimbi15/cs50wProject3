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
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#send').addEventListener('click', send_email);

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mails(emails, mailbox) {
  emails.forEach(email =>{
    let shortEmail = document.createElement("div"); //create div for short email view
    shortEmail.classList.add("short-email", "m-2"); //bootstrap classes
    shortEmail.addEventListener('click', () => load_email(email.id));
    shortEmail.addEventListener('mousemove', ()=>{
      shortEmail.style.border = "3px solid black"; 
    });
    shortEmail.addEventListener('mouseleave', () =>{
      shortEmail.style.border = "3px solid grey";
    });
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
     // add elements to short mail div
    let coint = document.createElement('div');
    coint.classList.add("m-3","d-flex", "flex-row" ,"align-items-center");
    if (!email.read){
      shortEmail.style.backgroundColor = "silver";
    }
    coint.appendChild(shortEmail);
    if(mailbox!='sent'){
    let archive = document.createElement('button');
    if (email.archived){
      archive.innerHTML = "Unarchive";
    }
    else{
      archive.innerHTML = "Archive";
    }
    archive.addEventListener('click', () => archivise(email));
    archive.classList.add("btn", "btn-primary", "h-50");
    coint.appendChild(archive);
    }

    document.getElementById('emails-view').appendChild(coint);
    shortEmail.appendChild(timestamp);

  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);  

    load_mails(emails,mailbox);
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
  setTimeout(() => load_mailbox('sent'), 20);
  

}

function load_email(email_id){
  fetch(`/emails/${email_id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);
    let view = document.querySelector('#email-view');
    view.replaceChildren();//clear previous mail
    document.querySelector('#emails-view').style.display = 'none';
    view.style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    let body = document.createElement('p');
    body.innerHTML = email.body;
    let sender = document.createElement('p');
    sender.innerHTML = `<span>From:</span> ${email.sender}`;
    recipients = document.createElement('p');
    recipients.innerHTML = '<span>To:</span>'

    email.recipients.forEach(recipient =>{
      recipients.innerHTML += ` ${recipient}`; // add all recipients
    })

    let subject = document.createElement('p');
    subject.innerHTML = `<span>Subject: </span>${email.subject}`;
    let timestamp = document.createElement('p');
    timestamp.innerHTML = `<span>Timestamp: </span>${email.timestamp}`;
    reply_btn = document.createElement('button');
    reply_btn.classList.add("btn", "btn-primary");
    reply_btn.innerHTML = "Reply";
    reply_btn.addEventListener('click', () => reply(email));
    bar = document.createElement('hr'); //create elements for mail

    view.appendChild(sender);
    view.appendChild(recipients);
    view.appendChild(subject);
    view.appendChild(timestamp);
    view.appendChild(reply_btn);
    view.appendChild(bar);
    view.appendChild(body);//add elements to DOM
    console.log(document.querySelector('#user').innerHTML);

    if(!email.read && email.recipients.includes(document.querySelector('#user').innerHTML)){//check for ownership
      mark_as_read(email);      
    }

});


}

function mark_as_read(email){
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

}

function archivise(email){
  if(email.archived){
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
  else{
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    
  }
  setTimeout(() => load_mailbox('inbox'),20);
  
}

function reply(email){
  compose_email();
  fetch(`/emails/${email.id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);

    recipient = email.sender;
    if(email.subject.slice(0,4)=="Re: "){
      subject = email.subject;
    }
    else{
      subject = `Re: ${email.subject}` //"On Jan 1 2020, 12:00 AM foo@example.com wrote:"
    }

    body = `On ${email.timestamp} ${email.sender} wrote: \n \n ${email.body}\n\n`
    document.querySelector('#compose-recipients').value = recipient;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;
  
    });


}