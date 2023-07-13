<template>
  <div
    id="job-information-spinner"
  />
</template>

<style scoped lang="scss">
div#job-information-spinner {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  height: 50px;
  width: 50px;
  margin: -25px 0 0 -25px;
  border: 5px solid transparent;
  border-top-color: #000000;
  border-bottom-color: #000000;
  border-radius: 50%;
  -webkit-animation: job-information-spinner 1s linear infinite;
  animation: job-information-spinner 1s linear infinite;
}

div#job-information-spinner:after {
  content: "";
  position: absolute;
  top: 5px;
  right: 5px;
  bottom: 5px;
  left: 5px;
  border: 5px solid transparent;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.25);
}

@keyframes job-information-spinner {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  50% {
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-webkit-keyframes job-information-spinner {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  50% {
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
