var jSetting = {
	authenticode: "f39a2dfa-fe29-471e-b014-8f86cb19314d",
    wsPort: "17022", // 使用一般 ws 連線
    wssPort: "17040", // 使用 ws+ssl 連線
    language: "tw",
	dialogTheme: "#0B45B6",
	connectErrStyle: {
		type: 1, // 0-alert, 1-error bar
		errBar: {
			innerElementId: null, //警告訊息要顯示在哪個DOM, 若找不到Id則顯示在body之前
			htmlContent:
				"<div style='position: fixed; z-index: 9999; color: #a94442; background-color: rgb(242, 222, 222); padding: 15px 55px; border-radius: 4px; border: 1px solid; box-shadow: #666666 0px 0px 8px;'>" +
					"<span class='closeErr' style='position: relative; float: right; right: -21px; color: inherit; font-weight: 600; text-decoration: none; cursor: pointer;'" +
					"onmouseover='this.style.fontWeight=\"800\";'" +
					"onmouseout='this.style.fontWeight=\"600\"'>X</span>" +
					"<strong>Warning DLCS!</strong> " + 
				"</div>",
			autoHide: {
				active: true,
				delay: 4000
			},
			fadeInOut: {
				active: true,
				topStart: -40,
				topEnd: 0,
				delay: 5
			}
		}
	},
    connectErrMsg: {
        activexNotFound_en: "Couldn't find ActiveX controls。",
        activexNotFound_tw: "偵測不到ActiveX元件。",
        activexNotSupported_en: "Your browser doesn't support ActiveX controls。 We recommend that you use the latest version of Chrome, Firefox, IE.",
        activexNotSupported_tw: "ActiveX 不支援，請改用 Chrome 或 Firefox。",
        connectFailed_en: "Failed to connect to JrsysSecurityTool。\r\nPlease refresh web page or restart JrsysSecurityTool。",
        connectFailed_tw: "與JrsysSecurityTool連線中斷或連線失敗。\r\n請重啟網頁或JrsysSecurityTool。",
        toolOrActivexNotFound_en: "Couldn't find JrsysSecurityTool and ActiveX controls。\r\nPlease install and launch JrsysSecurityTool，and ensure service is running。",
        toolOrActivexNotFound_tw: "未偵到 JrsysSecurityTool 或 ActiveX 相關元件。\r\n請安裝或執行 JrsysSecurityTool，並確定服務已開啟。",
        browserNoSupported_en: "Your browser doesn't support WebSocket。 We recommend that you use the latest version of Chrome, Firefox, IE.",
        browserNoSupported_tw: "此瀏覽器不支援WebSocket，請改用IE10以上版本或Chrome、Firefox。"
    },
	licenseXml: ""
};

function jPKI() { };

jPKI.prototype = {

    //一般回傳值
    rv: 0, //執行結果Code
    version: "", //元件版本
    jMethod: "", //執行方法
    errorMsg: "", //錯誤訊息

    //簽章回傳值
    signature: "", //簽章
    signerCert: "", //憑證

    //憑證解譯回傳值
    certVersion: "",//憑證版本
    certSerial: "",//憑證序號
    certIssuer: "",//憑證發行者
    certSubject: "",//憑證主旨
    certNotBefore_display: "",//憑證啟始日期
    certNotBefore_timet: "",//憑證啟始時間
    certNotAfter_display: "",//憑證到期日期
    certNotAfter_timet: "",//憑證到期時間
    certSubjectAlternativeName: "",//主旨別名
    certIdentityNoL4: "",//身分證末四碼
    certKeyUsage: "",//金鑰用途
	certUniqueId: "",//Unique Id
	certUniformOID: "",//統一編號
	certCardHolderRank: "",//正附卡別

    //執行方法預設值
    autoChoose: 1,
    signedDataWithContent: true, //是否包含原始資料
    isCertChainNeeded: false, //是否要包含憑證鍊
    digestAlg4Sign: 7, // 簽章演算法0-SHA1 3-MD5 7-SHA256
    alg4Encrypt: 1, // 加密演算法0-des 1-aes_128_cbc 2-aes_192 3-aes_256
    certChosenPriority: 2, //自動選擇效期最長(有效日期最晚)的憑證
    p11dll: "HiCOSPKCS11.dll",

    //相容舊Activex JS
    activexJrsysPKI: "",

	//**************************************************
    //                      UTILS
    //**************************************************
	
    //取得JrsysSecurityTool工具資訊
    GetToolInfo: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GetToolInfo"
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//取得JrsysSecurityTool工具資訊
    GetMethodList: function (mycallback) {
        if (getJrsysActiveXObj() !=  null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GetMethodList"
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //JrsysSecurityTool檢查版本
    CheckNewVersion: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "CheckNewVersion"
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //取得元件版本
    GetComVersion: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            mycallback(_activexJrsysPKI.version);
        }
        else {
            var obj = {
                MethodSelect: "GetComVersion"
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //檢查自然人憑證是否存在
    IsGCACardPresent: function (mycallback) {
        if (getJrsysActiveXObj() !=  null) {
            mycallback(_activexJrsysPKI.isGCACardPresent());
        }
        else {
            var obj = {
                MethodSelect: "IsGCACardPresent"
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    SetLicense: function (LicenseName, LicenseCode, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "SetLicense",
                ComMSCapiPara: {
                    LicenseName: LicenseName,
                    LicenseCode: LicenseCode
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//HexToBase64
    HexToBase64: function (HexString, mycallback) {
        if (getJrsysActiveXObj() != null) {
            var b64String = _activexJrsysPKI.hexToB64(HexString);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(b64String);
        }
        else {
            var obj = {
                MethodSelect: "HexToBase64",
                ComUtilsPara: {
                    HexString: HexString
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //Base64ToHex
    Base64ToHex: function (Base64String, mycallback) {
        if (getJrsysActiveXObj() != null) {
            var hexString = _activexJrsysPKI.b64ToHex(Base64String);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(hexString);
        }
        else {
            var obj = {
                MethodSelect: "Base64ToHex",
                ComUtilsPara: {
                    Base64String: Base64String
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //UnicodeToHex
    UnicodeToHex: function (UnicodeString, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "UnicodeToHex",
                ComUtilsPara: {
                    UnicodeString: UnicodeString
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //HexToUnicode
    HexToUnicode: function (HexString, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "HexToUnicode",
                ComUtilsPara: {
                    HexString: HexString
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//**************************************************
    //                      MSCAPI
    //**************************************************

    //指定憑證做資料簽章
    RsaSignedData: function (CN, OU, HexSerialNum, IssuerName, Data2BSignHex, mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.digestAlg4Sign = this.digestAlg4Sign;
            _activexJrsysPKI.signedDataWithContent = this.signedDataWithContent;
            _activexJrsysPKI.certChosenPriority = this.certChosenPriority;
            var hexP7SignedData = _activexJrsysPKI.rsaSignedDataUseCnOu(CN, OU, HexSerialNum, IssuerName, Data2BSignHex);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0) {
                this.errorMsg = _activexJrsysPKI.errMsg;
                this.signature = "";
                this.signerCert = "";
            }
            else {
                this.signature = _activexJrsysPKI.signature;
                this.signerCert = _activexJrsysPKI.signerCert;
            }
            mycallback(hexP7SignedData);
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedData",
                ComMSCapiPara: {
                    CN: CN,
                    OU: OU,
                    HexSerialNum: HexSerialNum,
                    IssuerName: IssuerName,
                    DigestAlgId: this.digestAlg4Sign,
                    Data2BSignHex: Data2BSignHex,
                    IsContentDetached: !this.signedDataWithContent,
                    CertChosenPriorityCriteria: this.certChosenPriority
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //選擇憑證簽章
    RsaSignedDataUserSelect: function (Data2BSignHex, mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.digestAlg4Sign = this.digestAlg4Sign;
            _activexJrsysPKI.signedDataWithContent = this.signedDataWithContent;
            _activexJrsysPKI.certChosenPriority = this.certChosenPriority;
            var hexP7SignedData = _activexJrsysPKI.rsaSignedDataUserSelect(Data2BSignHex, Data2BSignHex);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0) {
                this.errorMsg = _activexJrsysPKI.errMsg;
                this.signature = "";
                this.signerCert = "";
            }
            else {
                this.signature = _activexJrsysPKI.signature;
                this.signerCert = _activexJrsysPKI.signerCert;
            }
            mycallback(hexP7SignedData);
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataUserSelect",
                ComMSCapiPara: {
                    Data2BSignHex: Data2BSignHex,
                    IsCertChainNeeded: this.isCertChainNeeded
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//選擇憑證雜湊資料簽章
    RsaSignedDataWithContentDigest: function (HexCertSN, Digest2BSignHex, mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.digestAlg4Sign = this.digestAlg4Sign;
            var hexP7SignedData = _activexJrsysPKI.rsaSignedDataWithContentDigest(HexCertSN, Digest2BSignHex);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0) {
                this.errorMsg = _activexJrsysPKI.errMsg;
                this.signature = "";
                this.signerCert = "";
            }
            else {
                this.signature = _activexJrsysPKI.signature;
                this.signerCert = _activexJrsysPKI.signerCert;
            }
            mycallback(hexP7SignedData);
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataWithContentDigest",
                ComMSCapiPara: {
                    HexCertSN: HexCertSN,
                    DigestAlgId: this.digestAlg4Sign,
                    Digest2BSignHex: Digest2BSignHex
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
    //使用憑證加密
    RsaEncrypt: function (Data2BEncHex, mycallback) {
        if (getJrsysActiveXObj() != null) {
            var hexEnvelopedData = _activexJrsysPKI.rsaEncrypt(Data2BEncHex);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(hexEnvelopedData);
        }
        else {
            var obj = {
                MethodSelect: "RsaEncrypt",
                ComMSCapiPara: {
                    Data2BEncHex: Data2BEncHex
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //使用憑證解密
    RsaDecrypt: function (P7EnvDataHex, mycallback) {
        if (getJrsysActiveXObj() != null) {
            var decData = _activexJrsysPKI.rsaDecrypt(P7EnvDataHex);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(decData);
        }
        else {
            var obj = {
                MethodSelect: "RsaDecrypt",
                ComMSCapiPara: {
                    P7EnvDataHex: P7EnvDataHex
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //使用憑證簽章加密檔案
    RsaEncryptFileByCert: function (HexCertValue, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaEncryptFileByCert",
                ComUtilsPara: {
                    HexCertValue: HexCertValue,
                    SKeyAlg: this.alg4Encrypt
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //對資料做雜湊運算
    DigestData: function (HexData, DigestAlgId, mycallback) {
        if (getJrsysActiveXObj() != null) {
            var hexDataDigest = _activexJrsysPKI.digestData(HexData, DigestAlgId);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(hexDataDigest);
        }
        else {
            var obj = {
                MethodSelect: "DigestData",
                ComCryptoPara: {
                    HexData: HexData,
                    DigestAlgId: DigestAlgId
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //對檔案做雜湊運算
    DigestFile: function (DigestAlgId, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "DigestFile",
                ComCryptoPara: {
                    DigestAlgId: DigestAlgId
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯出軟體憑證成 Hex 字串
    ExportCertToHex: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            var hexCert = _activexJrsysPKI.exportCertToHex();
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(hexCert);
        }
        else {
            var obj = {
                MethodSelect: "ExportCertToHex"
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //解譯憑證
    DecodeCertificate: function (HexDerCertValue, mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.decodeCertificate(HexDerCertValue);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            else {
                this.certVersion = _activexJrsysPKI.certVersion;// 憑證版本
                this.certNotBefore_display = _activexJrsysPKI.certNotBefore_display;// 憑證啟始日期
                this.certNotBefore_timet = _activexJrsysPKI.certNotBefore_timet;
                this.certNotAfter_display = _activexJrsysPKI.certNotAfter_display;// 憑證到期日
                this.certNotAfter_timet = _activexJrsysPKI.certNotAfter_timet;
                this.certSerial = _activexJrsysPKI.certSerial;// 憑證序號
                this.certSubject = _activexJrsysPKI.certSubject;// 憑證主旨
                this.certIssuer = _activexJrsysPKI.certIssuer;// 憑證發行者
                this.certSubjectAlternativeName = _activexJrsysPKI.certSubjectAlternativeName;// 主旨別名 RFC 822 (Email)
                this.certIdentityNoL4 = _activexJrsysPKI.certIdentityNoL4;// 身分證末四碼
                this.certKeyUsage = _activexJrsysPKI.certKeyUsage;// 金鑰用途
            }
            mycallback("");
        }
        else {
            var obj = {
                MethodSelect: "DecodeCertificate",
                ComCertificatePara: {
                    HexDerCertValue: HexDerCertValue
                }
            };

            connectAndSend(function (serverData) {
                var comCertificatePara = serverData.ComCertificatePara;
                this.certVersion = comCertificatePara.CertVersion;// 憑證版本
                this.certNotBefore_display = comCertificatePara.CertNotBefore_display;// 憑證啟始日期
                this.certNotBefore_timet = comCertificatePara.CertNotBefore_timet;
                this.certNotAfter_display = comCertificatePara.CertNotAfter_display;// 憑證到期日
                this.certNotAfter_timet = comCertificatePara.CertNotAfter_timet;
                this.certSerial = comCertificatePara.CertSerial;// 憑證序號
                this.certSubject = comCertificatePara.CertSubject;// 憑證主旨
                this.certIssuer = comCertificatePara.CertIssuer;// 憑證發行者
                this.certSubjectAlternativeName = comCertificatePara.CertSubjectAlternativeName;// 主旨別名 RFC 822 (Email)
                this.certIdentityNoL4 = comCertificatePara.CertIdentityNoL4;// 身分證末四碼
                this.certKeyUsage = comCertificatePara.CertKeyUsage;// 金鑰用途
				this.certUniqueId = comCertificatePara.CertUniqueId;//Unique Id
				this.certUniformOID = comCertificatePara.CertUniformOID;//統一編號
				this.certCardHolderRank = comCertificatePara.CertCardHolderRank;//正附卡別
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯出PFX
    StoreExportPFX: function (HexSerialNum, SubjectCN, PfxPassword, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "StoreExportPFX",
                ComMSCapiPara: {
                    HexSerialNum: HexSerialNum,
                    SubjectCN: SubjectCN,
                    PfxPassword: PfxPassword,
                    IsFileDialogShown: false
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯入PFX
    StoreImportPFX: function (HexPfx, PfxPassword, Flag, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "StoreImportPFX",
                ComMSCapiPara: {
                    HexPfx: HexPfx,
                    PfxPassword: PfxPassword,
                    Flag: Flag
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯入CertPFX
    StoreImportCert: function (Base64Cert, ExistenceReplaced, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "StoreImportCert",
                ComMSCapiPara: {
                    Base64Cert: Base64Cert,
                    ExistenceReplaced: ExistenceReplaced
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //查詢憑證Context是否存在
    FindCtxByCertDERHex: function (HexCertDER, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "FindCtxByCertDERHex",
                ComMSCapiPara: {
                    HexCertDER: HexCertDER
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //任一條件尋找所有憑證序號
    FindCertValue: function (ValueType, SubjectName, IssuerName, NotBefore, NotAfter, KeyUsage, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "FindCertValue",
                ComMSCapiPara: {
                    ValueType: ValueType,
                    SubjectName: SubjectName,
                    IssuerName: IssuerName,
                    NotBefore: NotBefore,
                    NotAfter: NotAfter,
                    KeyUsage: KeyUsage
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //以憑證序號刪除憑證及金鑰(CAPI)
    DeleteKeyAndCertCAPI: function (HexIssuerDER, HexCertSN, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "DeleteKeyAndCertCAPI",
                ComMSCapiPara: {
                    HexIssuerDER: HexIssuerDER,
                    HexCertSN: HexCertSN
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //CAPI Store產生金鑰對與CSR
    ContainerGenCSR: function (ProviderName, ContainerName, ProviderType, SubjectDN, KeySize, KeySpec, KeyFlag, DigestAlgId, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ContainerGenCSR",
                ComMSCspPara: {
                    ProviderName: ProviderName,
                    ContainerName: ContainerName,
                    ProviderType: ProviderType,
                    SubjectDN: SubjectDN,
                    KeySize: KeySize,
                    KeySpec: KeySpec,
                    KeyFlag: KeyFlag,
                    DigestAlgId: DigestAlgId
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //將CA核發之憑證匯入CAPI Store並與對應的Key Container mapping.
    ContainerImportCert: function (ProviderName, ContainerName, ProviderType, KeySpec, Base64Cert, CheckContainerExistence, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ContainerImportCert",
                ComMSCspPara: {
                    ProviderName: ProviderName,
                    ContainerName: ContainerName,
                    ProviderType: ProviderType,
                    KeySpec: KeySpec,
                    Base64Cert: Base64Cert,
                    CheckContainerExistence: CheckContainerExistence
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //將CA核發之憑證匯入CAPI Store並與對應的Smart Card Key Container mapping.
    ContainerImportCertIntoSmartCard: function (ProviderName, ContainerName, ProviderType, KeySpec, Base64Cert, CheckContainerExistence, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ContainerImportCertIntoSmartCard",
                ComMSCspPara: {
                    ProviderName: ProviderName,
                    ContainerName: ContainerName,
                    ProviderType: ProviderType,
                    KeySpec: KeySpec,
                    Base64Cert: Base64Cert,
                    CheckContainerExistence: CheckContainerExistence
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯入金鑰對與憑證檔至Container
    ContainerImportKeyPairAndCertFromPFX: function (ProviderName, HexPfx, PfxPassword, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ContainerImportKeyPairAndCertFromPFX",
                ComMSCspPara: {
                    ProviderName: ProviderName,
                    HexPfx: HexPfx,
                    PfxPassword: PfxPassword
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //**************************************************
    //                  SpecifyPFX
    //**************************************************

    //使用PFX檔案做資料簽章
    RsaSignedDataFromPFX: function (PfxFilePath, PfxPassword, Data2BSigned, UseLastSetting, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataFromPFX",
                BouncyCastlePara: {
                    PfxFilePath: PfxFilePath,
                    PfxPassword: PfxPassword,
                    Data2BSigned: Data2BSigned,
                    DigestAlgId: this.digestAlg4Sign,
                    IsContentDetached: !this.signedDataWithContent,
                    UseLastSetting: UseLastSetting
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //使用PFX檔案做資料簽章
    RsaSignedDataFromPFXWithContentDigest: function (PfxFilePath, PfxPassword, Digest2BSignHex, UseLastSetting, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataFromPFXWithContentDigest",
                BouncyCastlePara: {
                    PfxFilePath: PfxFilePath,
                    PfxPassword: PfxPassword,
                    Digest2BSignHex: Digest2BSignHex,
                    DigestAlgId: this.digestAlg4Sign,
                    UseLastSetting: UseLastSetting
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //**************************************************
    //                     MircoSD
    //**************************************************

    //SD卡憑證簽章
    RsaSignedDataSD: function (Data2BSigned, PIN, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataSD",
                ComMicroSDPara: {
					PIN: PIN,
                    EncAlgId: this.digestAlg4Sign,
                    Data2BSigned: Data2BSigned
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //SD卡憑證加密
    RsaEncryptSD: function (Data2BEncrypted, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaEncryptSD",
                ComMicroSDPara: {
                    EncAlgId: this.alg4Encrypt,
                    Data2BEncrypted: Data2BEncrypted
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //SD卡憑證解密
    RsaDecryptSD: function (HexEnvData, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaDecryptSD",
                ComMicroSDPara: {
                    HexEnvData: HexEnvData
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //SD卡變更使用者PINCODE
    ChangeUserPinSD: function (PIN, NewPIN, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ChangeUserPinSD",
                ComMicroSDPara: {
                    PIN: PIN,
                    NewPIN: NewPIN
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //SD卡產生金鑰及憑證請求檔
    GenKeyAndCsrSD: function (PIN, KeySize, DigestAlgId, SubjectDN, SubjectAltName, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GenKeyAndCsrSD",
                ComMicroSDPara: {
                    PIN: PIN,
                    KeySize: KeySize,
                    DigestAlgId: DigestAlgId,
                    SubjectDN: SubjectDN,
                    SubjectAltName: SubjectAltName
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯入憑證至SD卡
    ImportCertificateSD: function (PIN, CertHex, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ImportCertificateSD",
                ComMicroSDPara: {
                    PIN: PIN,
                    CertHex: CertHex
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //**************************************************
    //                     PKCS11-GENERAL
    //**************************************************

    //智慧卡憑證簽章
    RsaSignedDataP11: function (Data2BSigned, PIN, mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.p11dll = this.p11dll;
            _activexJrsysPKI.autoChoose = this.autoChoose;
            _activexJrsysPKI.digestAlg4Sign = this.digestAlg4Sign;
            var hexP7SignedData = _activexJrsysPKI.rsaSignedDataP11(Data2BSigned, PIN);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0) {
                this.errorMsg = _activexJrsysPKI.errMsg;
                this.signature = "";
                this.signerCert = "";
            }
            else {
                this.signature = _activexJrsysPKI.signature;
                this.signerCert = _activexJrsysPKI.signerCert;
            }
            mycallback(hexP7SignedData);
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    IsSilent: this.autoChoose,
                    DigestAlg: this.digestAlg4Sign,
                    Data2BSigned: Data2BSigned,
					PIN: PIN,
                    IsCertChainNeeded: this.isCertChainNeeded
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //智慧卡憑證簽章輸入使用元件登入視窗
    RsaSignedDataP11NetForm: function (Data2BSigned, UseLastSetting, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataP11NetForm",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    IsSilent: this.autoChoose,
                    DigestAlg: this.digestAlg4Sign,
                    Data2BSigned: Data2BSigned,
					UseLastSetting: UseLastSetting
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //智慧卡憑證簽章
    RsaSignedDataWithContentDigestP11: function (Digest2BSignHex, PIN, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataWithContentDigestP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    IsSilent: this.autoChoose,
                    DigestAlg: this.digestAlg4Sign,
                    Digest2BSignHex: Digest2BSignHex,
					PIN: PIN
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //智慧卡憑證簽章
    RsaSignedDataWithContentDigestP11NetForm: function (HexSN, Digest2BSignHex, PIN, UseLastSetting, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaSignedDataWithContentDigestP11NetForm",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    HexSN: HexSN,
                    PIN: PIN,
                    DigestAlg: this.digestAlg4Sign,
                    Digest2BSignHex: Digest2BSignHex,
					UseLastSetting: UseLastSetting
                }
            };

            connectAndSend(function (serverData) {
                this.signature = serverData.Signature;
                this.signerCert = serverData.SignerCert;
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //智慧卡憑證加密
    RsaEncryptP11: function (Data2BEncrypted, HexCert, mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.p11dll = this.p11dll;
            _activexJrsysPKI.autoChoose = this.autoChoose;
            _activexJrsysPKI.alg4Encrypt = this.alg4Encrypt;
            var hexEnvelopedData = _activexJrsysPKI.rsaEncryptP11(Data2BEncrypted);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(hexEnvelopedData);
        }
        else {
            var obj = {
                MethodSelect: "RsaEncryptP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    IsSilent: this.autoChoose,
                    SKeyAlg: this.alg4Encrypt,
                    Data2BEncrypted: Data2BEncrypted,
					HexCert: HexCert
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //智慧卡憑證解密
    RsaDecryptP11: function (HexP7EnvelopedData, PIN, mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.p11dll = this.p11dll;
            var decData = _activexJrsysPKI.rsaDecryptP11(HexP7EnvelopedData);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(decData);
        }
        else {
            var obj = {
                MethodSelect: "RsaDecryptP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    IsSilent: 1,
                    HexP7EnvelopedData: HexP7EnvelopedData,
					PIN: PIN
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //智慧卡憑證加密檔案
    RsaEncryptFileByP11: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaEncryptFileByP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    IsSilent: 1,
                    SKeyAlg: this.alg4Encrypt
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //智慧卡憑證解密檔案
    RsaDecryptFileByP11: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "RsaDecryptFileByP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    IsSilent: 1
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯出智慧卡憑證成Hex字串
    ExportCertToHexP11: function (KeyUsage, mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.p11dll = this.p11dll;
            _activexJrsysPKI.autoChoose = true;
            var hexCert = _activexJrsysPKI.exportCertToHexP11(KeyUsage);
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(hexCert);
        }
        else {
            var obj = {
                MethodSelect: "ExportCertToHexP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    IsSilent: 1,
                    KeyUsage: KeyUsage
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯出智慧卡憑證成Hex字串
    ExportAllCertToHexP11: function (KeyUsage, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ExportAllCertToHexP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    KeyUsage: KeyUsage
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//**************************************************
    //               PKCS11-SMARTCARD
    //**************************************************
	
	//智慧卡序號 by Wesley 20160907
    GetSmartCardSnP11: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            _activexJrsysPKI.p11dll = this.p11dll;
            var tokenSn = _activexJrsysPKI.getTokenSNP11();
            this.rv = _activexJrsysPKI.rv;
            if (this.rv != 0)
                this.errorMsg = _activexJrsysPKI.errMsg;
            mycallback(tokenSn);
        }
        else {
            var obj = {
                MethodSelect: "GetSmartCardSnP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //取得智慧卡資訊
    GetSmartCardInfoP11: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GetSmartCardInfoP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //取得所有智慧卡資訊
    GetAllSmartCardInfoP11: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GetAllSmartCardInfoP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//選擇智慧卡
    SelectSmartCardP11: function (HexSN, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "SelectSmartCardP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
					HexSN: HexSN
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

	//智慧卡登入
    LoginSmartCardP11: function (mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "LoginSmartCardP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//智慧卡變更使用者密碼
	ChangeUserPinP11: function (PIN, NewPIN, mycallback) {
		if (getJrsysActiveXObj() != null) {
			printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
		}
		else {
			var obj = {
				MethodSelect: "ChangeUserPinP11",
				ComPKCS11Para: {
					P11DriverName: this.p11dll,
					PIN: PIN,
					NewPIN: NewPIN
				}
			};

			connectAndSend(function (serverData) {
				mycallback(serverData.Message);
			}.bind(this), obj);
		}
	},
	
	//**************************************************
    //               PKCS11-CERTMANAGER
    //**************************************************

	//取得公鑰值
    GetPublicKeyByIndexP11: function (Index, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GetPublicKeyByIndexP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
					Index: Index
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//取得公鑰值
    GetPublicKeyByLabelP11: function (KeyLabel, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GetPublicKeyByLabelP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
					KeyLabel: KeyLabel
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
    //匯入PFX至智慧卡
    ImportKeyPairAndCertFromPFXP11: function (PIN, CertLabel, KeyLabel, HexPfx, PfxPassword, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ImportKeyPairAndCertFromPFXP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    PIN: PIN,
                    CertLabel: CertLabel,
                    KeyLabel: KeyLabel,
                    HexPfx: HexPfx,
                    PfxPassword: PfxPassword
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //以憑證序號刪除智慧卡憑證及金鑰
    DeleteKeyAndCertP11: function (PIN, HexSN, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "DeleteKeyAndCertP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    PIN: PIN,
                    HexSN: HexSN
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //產生金鑰及憑證請求檔
    GenKeyAndCsrP11: function (PIN, KeyLenInBits, KeyUsage, DigestAlgId, KeyLabel, ContainerName, SubjectDN, SubjectAltName, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GenKeyAndCsrP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    PIN: PIN,
                    KeyLenInBits: KeyLenInBits,
                    KeyUsage: KeyUsage,
                    DigestAlgId: DigestAlgId,
                    KeyLabel: KeyLabel,
                    ContainerName: ContainerName,
                    SubjectDN: SubjectDN,
                    SubjectAltName: SubjectAltName
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//產生憑證請求檔
    GenCsrByPublicKeyLabelP11: function (PIN, KeyLabel, DigestAlgId, SubjectDN, SubjectAltName, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GenCsrByPublicKeyLabelP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    PIN: PIN,
					KeyLabel: KeyLabel,
                    DigestAlgId: DigestAlgId,
                    SubjectDN: SubjectDN,
                    SubjectAltName: SubjectAltName
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯入憑證至智慧卡
    ImportCertificateP11: function (PIN, CertLabel, ContainerName, HexCert, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ImportCertificateP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    PIN: PIN,
                    CertLabel: CertLabel,
                    ContainerName: ContainerName,
                    HexCert: HexCert
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
	//匯入憑證至智慧卡
    ImportCertificate2P11: function (PIN, CertLabel, HexCert, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ImportCertificate2P11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    PIN: PIN,
                    CertLabel: CertLabel,
                    HexCert: HexCert
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //使用Session Lable取得智慧卡public key module
    GetSInfoP11: function (PIN, SessionLabel, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "GetSInfoP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    PIN: PIN,
                    SessionLabel: SessionLabel
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },

    //匯入已加密後的Hex格式PFX
    ImportSKSP11: function (PIN, CertLabel, KeyLabel, SessionLabel, HexEncPfx, PfxPassword, mycallback) {
        if (getJrsysActiveXObj() != null) {
            printErrorMsg(eval("jSetting.connectErrMsg.activexNotSupported_" + jSetting.language));
        }
        else {
            var obj = {
                MethodSelect: "ImportSKSP11",
                ComPKCS11Para: {
                    P11DriverName: this.p11dll,
                    PIN: PIN,
                    CertLabel: CertLabel,
                    KeyLabel: KeyLabel,
                    SessionLabel: SessionLabel,
                    HexEncPfx: HexEncPfx,
                    PfxPassword: PfxPassword
                }
            };

            connectAndSend(function (serverData) {
                mycallback(serverData.Message);
            }.bind(this), obj);
        }
    },
	
    Empty: function () {
        /*function end*/
    }
};

//WebSocket連線後送出資料
function connectAndSend(mycallback, obj) {
    if ("WebSocket" in window) { //IE10以上、Chrome、firefox
        var webSocket;
        if (document.location.protocol.indexOf("https") != -1)
            webSocket = new WebSocket("wss://127.0.0.1:" + jSetting.wssPort);
        else
            webSocket = new WebSocket("ws://127.0.0.1:" + jSetting.wsPort);

        webSocket.onopen = function () {
            console.log("::OPEN");
			obj.DialogTheme = jSetting.dialogTheme;
			obj.Authenticode = jSetting.authenticode;
			obj.LicenseXml = jSetting.licenseXml;
            webSocket.send(JSON.stringify(obj));
        };

        webSocket.onmessage = function (evt) {
            webSocket.close();
			
            var serverData = JSON.parse(evt.data);
			jPKI.prototype.rv = serverData.RV;
            jPKI.prototype.jMethod = serverData.MethodSelect;
            
			if (serverData.IsError) {
                jPKI.prototype.errorMsg = serverData.Message;
			}
			
			switch(serverData.MethodSelect)
			{
				case "IPVerification":
				{
					printErrorMsg(serverData.Message);
					break;
				}
				case "CheckExpirationDate":
				{
					printErrorMsg(serverData.Message);
					break;
				}
				case "CheckLicenseFile":
				{
					printErrorMsg(serverData.Message);
					break;
				}
				default:
				{
					mycallback(serverData);
				}	
			}
        };

        webSocket.onclose = function (event) {
            console.log("::CLOSE");
            // if (event.code === 1006)
                // printErrorMsg(eval("jSetting.connectErrMsg.connectFailed_" + jSetting.language));

            webSocket = null;
        };

        webSocket.onerror = function (event) {
            if (getIEVersion() >= 10) { //IE10以上未安裝元件
                printErrorMsg(eval("jSetting.connectErrMsg.toolOrActivexNotFound_" + jSetting.language));
            } else {
                printErrorMsg(eval("jSetting.connectErrMsg.connectFailed_" + jSetting.language));
            }
        };
    }
    else {
        if (getIEVersion() == 0) {
            printErrorMsg(eval("jSetting.connectErrMsg.browserNoSupported_" + jSetting.language));
        } else { //IE<10
			printErrorMsg(eval("jSetting.connectErrMsg.activexNotFound_" + jSetting.language));
        }
    }
}

function getIEVersion() {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
            (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                        (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;

    if (Sys.ie) {
        return Sys.ie.split(".")[0]
    }
    else
        return 0;
}

var _activexJrsysPKI;
function getJrsysActiveXObj() {
    if (_activexJrsysPKI == undefined || _activexJrsysPKI == "" || _activexJrsysPKI == null){
		_activexJrsysPKI = null;
		var browserVer = getIEVersion();
		if (browserVer != 0 && browserVer < 10) { //IE10以下採ActiveX元件
			try {
				_activexJrsysPKI = new jrsysPKI();
				if (_activexJrsysPKI.rv != 0) {
					_activexJrsysPKI = null;
					printErrorMsg(_activexJrsysPKI.errMsg);
				}
			}
			catch (err) {
				_activexJrsysPKI = null;
				printErrorMsg(eval("jSetting.connectErrMsg.activexNotFound_" + jSetting.language));
			}
		}
	}
	return _activexJrsysPKI;
}

var hideVar;
var fadeInOutVar;
var position;
var opacityUnit;
function printErrorMsg(msg) {
	
	var connectErrStyle = jSetting.connectErrStyle;
	var type = jSetting.connectErrStyle.type;
	var errBar = connectErrStyle.errBar;
	var htmlContent = errBar.htmlContent;
	var fadeInOut = errBar.fadeInOut;
	var autoHide = errBar.autoHide;
	
	if(type == 0 || htmlContent == undefined || htmlContent == "" || htmlContent == null){
		alert(msg);
		return;
	}
	
    var barHide = function(){
		var errBarDiv = document.getElementById("errBarDiv");
		if (errBarDiv != null) {
			if(fadeInOut.active){
				fadeEffect(1, function(){
					var errBarDiv = document.getElementById("errBarDiv");
					if (errBarDiv != null) {
						errBarDiv.parentNode.removeChild(errBarDiv);
					}
				});
			}else{
				errBarDiv.parentNode.removeChild(errBarDiv);
			}
		}
	}
	
	//0-in 1-out
	var fadeEffect = function(mode, callback){
		var msgBar = document.getElementById("errBarDiv").children[0];
		if(msgBar == null)
			return;
		
		opacityUnit = 1 / Math.abs(fadeInOut.topEnd - fadeInOut.topStart);
		position = mode == 0 ? fadeInOut.topStart : fadeInOut.topEnd;
		msgBar.style.top = position + "px";
		msgBar.style.opacity = mode == 0 ? 0 : 1;
		msgBar.style.filter = mode == 0 ? "Alpha(opacity=0)" : "Alpha(opacity=100)";
		
		clearInterval(fadeInOutVar);
		fadeInOutVar = setInterval(function(){
			var msgBar = document.getElementById("errBarDiv").children[0];
			if(msgBar == null){
				clearInterval(fadeInOutVar);
				callback();
				return;
			}
				
			if(mode == 0){
				position++;
				if(position >= fadeInOut.topEnd){
					clearInterval(fadeInOutVar);
					callback();
				}
			}else{
				position--;
				if(position <= fadeInOut.topStart){
					clearInterval(fadeInOutVar);
					callback();
				}
			}
			
			msgBar.style.top = position + "px";
			var currOpacity = parseFloat(msgBar.style.opacity);
			msgBar.style.opacity = mode == 0 ? currOpacity + opacityUnit : currOpacity - opacityUnit;
			msgBar.style.filter = mode == 0 ? "Alpha(opacity=" + (currOpacity + opacityUnit) * 100 + ")" : "Alpha(opacity=" + (currOpacity - opacityUnit) * 100 + ")";
			
		}, fadeInOut.delay);
	}
    
	barHide();
	if(autoHide.active){
		clearTimeout(hideVar);
	}
	
	var errBarDiv = document.getElementById("errBarDiv");
	if (errBarDiv == null) {
		errBarDiv = document.createElement("div");
		errBarDiv.id = "errBarDiv";
	}
    
    errBarDiv.innerHTML = htmlContent;
	errBarDiv.style.display = "none";
	
	var target = document.getElementById(errBar.innerElementId);
	var isNoTarget = (target == undefined || target == "" || target == null);
	if(isNoTarget){
		document.body.insertBefore(errBarDiv, document.body.firstChild);
	}else{
		target.insertBefore(errBarDiv, target.childNodes[0]);
	}
	
	var msgBar = document.getElementById("errBarDiv").children[0];
	if(isNoTarget){
		msgBar.style.width = "100%";
	}else{
		msgBar.style.width = target.offsetWidth + "px";
	}
	msgBar.innerHTML = msgBar.innerHTML + msg;
	
	msgBar.getElementsByClassName("closeErr")[0].onclick = function(){
		errBarDiv.parentElement.removeChild(errBarDiv);
	}
	
	if(fadeInOut.active){
		fadeEffect(0, function(){});
	}else{
		msgBar.style.top = 0;
	}
	
	errBarDiv.style.display = "block";
	
	if(autoHide.active){
		hideVar = setTimeout(barHide, autoHide.delay);
	}
}