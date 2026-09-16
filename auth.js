const GATE_KEY = "aqibsweb_unlocked";
const PHONE_RE = /^[6-9]\d{9}$/;
/** Test code until a real SMS key is added. Not sent by any carrier. */
const ACCESS_OTP = "4444";

let pendingPhone = "";
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
  $("otp-hint").textContent = `Enter 4444 for +91 ${phone10}`;
  $("gate-otp").value = "";
  $("gate-otp").focus();
  startResendClock();
}

function showPhoneStep() {
  pendingPhone = "";
  $("otp-form").hidden = true;
  $("phone-form").hidden = false;
  showError("otp-error", "");
  $("gate-phone").focus();
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
  if (!phone || !otp) return;

  digitsOnly(phone, 10);
  digitsOnly(otp, 4);

  $("phone-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const value = phone.value.trim();
    if (!PHONE_RE.test(value)) {
      phone.classList.add("is-bad");
      showError("phone-error", "Please enter a valid 10-digit number");
      phone.focus();
      return;
    }
    pendingPhone = value;
    showError("phone-error", "");
    setBusy(sendBtn, true, "Sending…");
    window.setTimeout(() => {
      setBusy(sendBtn, false, "Send OTP");
      showOtpStep(value);
    }, 400);
  });

  $("otp-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = otp.value.trim();
    if (code !== ACCESS_OTP || pendingPhone !== phone.value.trim()) {
      otp.classList.add("is-bad");
      showError("otp-error", "Invalid OTP, please try again");
      return;
    }
    unlockSite();
  });

  $("resend-btn").addEventListener("click", () => {
    const value = phone.value.trim();
    if (!PHONE_RE.test(value) || $("resend-btn").disabled) return;
    pendingPhone = value;
    showOtpStep(value);
  });

  $("change-phone").addEventListener("click", showPhoneStep);
  phone.focus();
}
