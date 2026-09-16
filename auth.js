import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { firebaseConfig, firebaseReady } from "./firebase-config.js";

const GATE_KEY = "aqibsweb_unlocked";
const PHONE_RE = /^[6-9]\d{9}$/;

let confirmation = null;
let recaptcha = null;
let timer = null;
let left = 0;

const $ = (id) => document.getElementById(id);

function showError(id, message) {
  const el = $(id);
  if (!el) return;
  el.hidden = !message;
  el.textContent = message || "";
}

function unlockSite() {
  const root = document.documentElement;
  const gate = $("gate");
  sessionStorage.setItem(GATE_KEY, "1");
  root.classList.add("unlocking");
  window.setTimeout(() => {
    root.classList.add("unlocked");
    root.classList.remove("unlocking");
    if (gate) gate.hidden = true;
  }, 420);
}

function digitsOnly(input, max) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, max);
    input.classList.remove("is-bad");
    showError("phone-error", "");
    showError("otp-error", "");
  });
}

function setBusy(btn, busy, label) {
  if (!btn) return;
  btn.disabled = busy;
  if (label) btn.textContent = label;
}

function startResendClock() {
  left = 60;
  const btn = $("resend-btn");
  if (timer) window.clearInterval(timer);
  btn.disabled = true;
  btn.textContent = `Resend OTP in ${left}s`;
  timer = window.setInterval(() => {
    left -= 1;
    if (left <= 0) {
      window.clearInterval(timer);
      btn.disabled = false;
      btn.textContent = "Resend OTP";
      return;
    }
    btn.textContent = `Resend OTP in ${left}s`;
  }, 1000);
}

function showOtpStep(phone10) {
  $("phone-form").hidden = true;
  $("otp-form").hidden = false;
  $("otp-hint").textContent = `Code sent to +91 ${phone10}`;
  $("gate-otp").value = "";
  $("gate-otp").focus();
  startResendClock();
}

function showPhoneStep() {
  confirmation = null;
  $("otp-form").hidden = true;
  $("phone-form").hidden = false;
  showError("otp-error", "");
  $("gate-phone").focus();
}

function initRecaptcha(auth) {
  if (recaptcha) return recaptcha;
  recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
  });
  return recaptcha;
}

async function sendCode(auth, phone10) {
  if (!firebaseReady()) {
    throw new Error(
      "Firebase Phone Auth is not configured. Add keys in firebase-config.js (see FIREBASE.md)."
    );
  }
  const verifier = initRecaptcha(auth);
  confirmation = await signInWithPhoneNumber(auth, `+91${phone10}`, verifier);
}

export function setupAuth() {
  if (sessionStorage.getItem(GATE_KEY) === "1") {
    document.documentElement.classList.add("unlocked");
    const gate = $("gate");
    if (gate) gate.hidden = true;
    return;
  }

  const phone = $("gate-phone");
  const otp = $("gate-otp");
  const sendBtn = $("send-btn");
  const verifyBtn = $("verify-btn");
  if (!phone || !otp) return;

  digitsOnly(phone, 10);
  digitsOnly(otp, 6);

  let auth = null;
  if (firebaseReady()) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) unlockSite();
    });
  }

  $("phone-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = phone.value.trim();
    if (!PHONE_RE.test(value)) {
      phone.classList.add("is-bad");
      showError("phone-error", "Please enter a valid 10-digit number");
      phone.focus();
      return;
    }
    setBusy(sendBtn, true, "Sending…");
    showError("phone-error", "");
    try {
      await sendCode(auth, value);
      showOtpStep(value);
    } catch (err) {
      console.error(err);
      showError("phone-error", err.message || "Could not send OTP");
      if (recaptcha) {
        recaptcha.clear();
        recaptcha = null;
      }
    } finally {
      setBusy(sendBtn, false, "Send OTP");
    }
  });

  $("otp-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = otp.value.trim();
    if (!/^\d{6}$/.test(code)) {
      otp.classList.add("is-bad");
      showError("otp-error", "Invalid OTP, please try again");
      return;
    }
    if (!confirmation) {
      showError("otp-error", "Request a new code first");
      return;
    }
    setBusy(verifyBtn, true, "Verifying…");
    try {
      await confirmation.confirm(code);
      unlockSite();
    } catch (err) {
      console.error(err);
      otp.classList.add("is-bad");
      showError("otp-error", "Invalid OTP, please try again");
    } finally {
      setBusy(verifyBtn, false, "Verify OTP");
    }
  });

  $("resend-btn").addEventListener("click", async () => {
    const value = phone.value.trim();
    if (!PHONE_RE.test(value) || $("resend-btn").disabled) return;
    setBusy($("resend-btn"), true, "Sending…");
    try {
      if (recaptcha) {
        recaptcha.clear();
        recaptcha = null;
      }
      await sendCode(auth, value);
      startResendClock();
      showError("otp-error", "");
    } catch (err) {
      showError("otp-error", err.message || "Could not resend OTP");
      $("resend-btn").disabled = false;
      $("resend-btn").textContent = "Resend OTP";
    }
  });

  $("change-phone").addEventListener("click", showPhoneStep);
  phone.focus();
}
