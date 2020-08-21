@extends('_layouts.master')

@section('content')


    <style>
      body {
        padding: 0;
        margin: 0;
        min-width: 30rem;
        font-family: "arial,helvetica,Times New Roman", Times, serif;
      }
      h1 {
        text-align: center;
      }
      section {
        max-width: 640px;
        margin: 0 auto;
      }
      .form-btn,
      .form-group {
        display: flex;
        flex-flow: column;
        padding: 0 4rem;
      }
      .form-group {
        display: flex;
        flex-flow: column;
        padding: 1rem 4rem;
      }
      label {
        font-weight: bold;
      }
      input[type="text"],
      input[type="password"],
      #Result {
        width: 100%;
        padding: 0.25rem 0.5rem;
        border: 1px solid rgb(204 204 204);
        border-radius: 0.25rem;
      }
      #Result {
        font-size: 1.2rem;
        color: #ccc;
        word-break: break-all;
      }
      #Result.done {
        color: #1b5e20;
      }
      .btn-group {
        margin: 0 auto;
      }
      .btn {
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        font-size: 1.2rem;
        background-color: #4caf50; /* Green */
        cursor: pointer;
        text-transform: capitalize;
        font-weight: bold;
      }
      .btn[disabled] {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    </style>
  </head>
  <body>
    <h1>PKCS11 FIRMA DE DATOS</h1>
    <section>
      <form>
        <div class="form-group">
          <label for="Data2BSigned">Texto para firmar</label>
          <input
            type="text"
            id="Data2BSigned"
            placeholder="Texto para firmar"
            value="PRUEBA"
          />
        </div>
        <div class="form-group">
          <label for="PIN">PIN</label>
          <input type="password" id="PIN" placeholder="PIN" value="123" />
        </div>
        <div class="form-btn">
          <div class="btn-group">
            <button
              type="button"
              id="Sign"
              class="btn"
              onclick="RsaSignedDataP11()"
              disabled
            >
              Firmar!
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Resultado</label>
          <p id="Result">Resultado...</p>
        </div>
      </form>
    </section>
    <script>
      function RsaSignedDataP11() {
        let data = document.querySelector("#Data2BSigned");
        let PIN = document.querySelector("#PIN");

        setResult("Working...");

        var myPKI = new jPKI();
        myPKI.digestAlg4Sign = 0; //algorithm(0-sha1, 3-md5, 7-sha256)
        myPKI.isCertChainNeeded = false;
        myPKI.p11dll = "HiCOSPKCS11.dll";
        myPKI.RsaSignedDataP11(data.value, PIN.value, function (returnValue) {
          var showMsg = "";
          if (myPKI.rv == 0) {
            showMsg =
              "SignedP7:<br>" +
              returnValue +
              "<br><br>SignerCert:<br>" +
              myPKI.signerCert +
              "<br>";
          } else {
            let rv = myPKI.rv.toString();
            showMsg = myPKI.errorMsg + rv.toString() + "<br/>";
          }
          setResult(showMsg);
        });
      }
      function doLoad() {
        var userAgent = navigator.userAgent;
        var isChrome = false;
        let btn = document.querySelector("#Sign");
        if (userAgent.indexOf("Chrome") != -1) {
          isChrome = true;
          btn.disabled = false;
        } else {
          setResult("Browser no soportado unicamente Chrome");
        }
        console.log("Do Load!", isChrome ? "Chrome" : "Not Chrome");
      }
      function setResult(text) {
        let result = document.querySelector("#Result");
        result.innerHTML = text;
        result.classList.add("done");
      }
      if (window.attachEvent) {
        window.attachEvent("onload", doLoad);
      } else if (window.addEventListener) {
        window.addEventListener("load", doLoad, false);
      } else {
        document.addEventListener("load", doLoad, false);
      }
    </script>
@endsection
