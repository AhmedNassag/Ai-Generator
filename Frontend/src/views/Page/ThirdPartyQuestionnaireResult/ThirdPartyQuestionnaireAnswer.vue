<template>
    <div id="app">
        <div class="container">

            <div v-if="isAssessmentComplete" class="position-absolute top-50 start-50 translate-middle text-center">
                <div class="card border-warning shadow-lg bg-warning-subtle rounded" style="max-width: 500px;">
                    <div class="card-body">
                        <h4 class="card-title text-danger fw-bold">
                            Access Denied
                        </h4>
                        <p class="card-text text-dark fs-5">
                            You cannot access this view because your assessment is already completed.
                        </p>
                    </div>
                </div>
            </div>

            <div v-else>

                <!-- Email Modal -->
                <div class="modal fade" id="emailModal" ref="emailModal" tabindex="-1" aria-hidden="true"
                    data-bs-backdrop="static">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Enter your email</h5>
                                <button type="button" id="closeEmailModalBtn" class="btn-close d-none"
                                    data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="form-floating mb-3">
                                    <input type="email" class="form-control"
                                        :class="{ 'is-invalid': emailError, 'is-valid': isEmailValid && !emailError }"
                                        id="contactEmail" v-model="contactEmail" @input="validateEmail"
                                        placeholder="name@example.com" />
                                    <label for="contactEmail">Email address</label>
                                    <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" :disabled="!isEmailValid"
                                    @click.prevent="checkEmail">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Password Modal -->
                <div class="modal fade" id="passwordModal" ref="passwordModal" tabindex="-1" aria-hidden="true"
                    data-bs-backdrop="static">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Enter password which received at mail</h5>
                                <button type="button" id="closePasswordModalBtn" class="btn-close d-none"
                                    data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="form-floating mb-3">
                                    <input type="password" class="form-control" :class="{ 'is-invalid': passwordError }"
                                        id="accessPassword" v-model="accessPassword" placeholder="Password" />
                                    <label for="accessPassword">Password</label>
                                    <div v-if="passwordError" class="invalid-feedback">{{ passwordError }}</div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-primary" @click="checkPassword">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Questionnaire Form -->
                <form v-if="showQuestionnaire" id="questionnaireForm" class="form-control w-100 border-0">
                    <h1 class="text-primary fw-bold text-center m-4">{{ questionnaireData.name }}</h1>

                    <!-- Remedation Note (if exists) -->
                    <div v-if="questionnaireData?.latest_contact_questionnaire_answer?.note" class="remedation-card">
                        <label class="form-label mb-3">
                            <span class="text-primary fw-bold">Remedation note:</span>
                        </label>
                        <p v-html="questionnaireData?.latest_contact_questionnaire_answer?.note"></p>
                    </div>

                    <!-- Instructions -->
                    <label class="form-label m-4">
                        <span class="text-primary fw-bold">Assessment Instructions:</span>
                        {{ questionnaireData.instructions || 'No instructions available' }}
                    </label>

                    <!-- Questions -->
                    <div v-for="(question, index) in displayedQuestions" :key="question.id" class="question-card">
                        <label class="form-label mb-3">
                            <span class="text-primary fw-bold">Question {{ index + 1 }}:</span>
                            {{ question.question }}
                        </label>

                        <!-- Answers -->
                        <div v-for="answer in question.answers" :key="answer.id" class="form-check mb-3">
                            <input class="form-check-input" type="radio" :name="`answer[${question.id}]`"
                                :id="`answer-${answer.id}`" :value="answer.id" v-model="userAnswers[question.id]" />
                            <label class="form-check-label" :for="`answer-${answer.id}`">{{ answer.text }}</label>
                        </div>

                        <!-- Comments -->
                        <div class="form-floating">
                            <textarea class="form-control" :id="`comment-${question.id}`"
                                :placeholder="`Comment for question ${index + 1}`" v-model="userComments[question.id]"
                                style="height: 100px"></textarea>
                            <label :for="`comment-${question.id}`">Comments</label>
                        </div>
                    </div>


                    <!-- Submit Buttons -->
                    <div class="btn-group my-5">
                        <button type="button" class="btn btn-secondary" @click="submitQuestionnaire('draft')"
                            :disabled="isDraftDisabled">Draft</button>
                        <button type="button" class="btn btn-primary mx-2"
                            @click="submitQuestionnaire('complete')">Complete</button>
                    </div>
                </form>
            </div>

        </div>

        <!-- Back to Top Button -->
        <button id="backToTopBtn" @click="scrollToTop" :class="{ 'show': showBackToTop, 'hide': !showBackToTop }">
            <i class="fas fa-arrow-up"></i>
        </button>
    </div>

    <!-- email modal btn -->
    <button type="button" class="btn d-none" id="openEmailModal" data-bs-toggle="modal" data-bs-target="#emailModal">
        email modal
    </button>

    <!-- password modal btn -->
    <button type="button" class="btn d-none" id="openPasswordModal" data-bs-toggle="modal"
        data-bs-target="#passwordModal">
        password modal
    </button>

</template>

<script>

import ThirdPartyQuestionnaire from "@/API/ThirdPartyQuestionnaire/ThirdPartyQuestionnaire";
import axios from "axios";

export default {
    name: 'App',

    setup() {
        // Initialize API and other required properties
        const api = new ThirdPartyQuestionnaire();
        // Return properties for setup to be used in the template
        return {
            api,
        };
    },
    data() {
        return {
            // User input
            contactEmail: '',
            accessPassword: '',

            // Validation
            isEmailValid: false,
            emailError: '',
            passwordError: '',

            // UI state
            showQuestionnaire: false,
            showBackToTop: false,


            // User responses
            userAnswers: {},
            userComments: {},

            originalAnswers: {},
            originalComments: {},
            questionnaireData: [],
            isDraftDisabled: false,

        };
    },
    computed: {
        isFromLatestResults() {
            return (
                this.questionnaireData.latest_contact_questionnaire_answer?.contact_questionnaire_answer_results &&
                this.questionnaireData.latest_contact_questionnaire_answer.contact_questionnaire_answer_results.length > 0
            );
        },
        // displayedQuestions() {
        //     return this.isFromLatestResults
        //     ? this.questionnaireData.latest_contact_questionnaire_answer.contact_questionnaire_answer_results.questions
        //     : this.questionnaireData.questions;
        // }

        displayedQuestions() {
            return this.isFromLatestResults
                ? this.questionnaireData.latest_contact_questionnaire_answer.contact_questionnaire_answer_results.map(result => result.question)
                // : this.questionnaireData.questions;
                : this.questionnaireData.assessment.template.questions;
        },
        isAssessmentComplete() {
            return (
                this.questionnaireData?.latest_contact_questionnaire_answer &&
                this.questionnaireData.latest_contact_questionnaire_answer.submission_type === 'complete'
            );
        }
    },
    async mounted() {
        await this.fetchQuestionnaireData();

        if (!this.isAssessmentComplete) {
            document.getElementById('openEmailModal').click();
        }

        // Initialize scroll event listener
        window.addEventListener('scroll', this.handleScroll);

        // Pre-populate answers and comments from latestResults if available
        if (this.isFromLatestResults) {
            this.questionnaireData.latest_contact_questionnaire_answer.contact_questionnaire_answer_results.forEach(result => {
                this.userAnswers[result.question_id] = result.answer_id;
                this.userComments[result.question_id] = result.comment;
            });
        }

        console.log('this.userAnswers');
        console.log(this.userAnswers); // return empty

        this.originalAnswers = JSON.parse(JSON.stringify(this.userAnswers));
        this.originalComments = JSON.parse(JSON.stringify(this.userComments));
    },

    watch: {
        questionnaireData: {
            handler(newData) {
                if (this.isFromLatestResults) {
                    newData.latest_contact_questionnaire_answer.contact_questionnaire_answer_results.forEach(result => {
                        this.userAnswers[result.question_id] = result.answer_id;
                        this.userComments[result.question_id] = result.comment;
                    });

                    console.log("Updated userAnswers:", this.userAnswers);
                }
            },
            deep: true,
            immediate: true
        },

        userAnswers: {
            handler() {
                this.checkForChanges();
            },
            deep: true
        },
        userComments: {
            handler() {
                this.checkForChanges();
            },
            deep: true
        }
    },
    beforeDestroy() {
        // Remove scroll event listener
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        validateEmail() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!this.contactEmail) {
                this.emailError = 'Email is required.';
                this.isEmailValid = false;
            } else if (!emailPattern.test(this.contactEmail)) {
                this.emailError = 'Please enter a valid email address.';
                this.isEmailValid = false;
            } else {
                this.emailError = '';
                this.isEmailValid = true;
            }
        },
        checkEmail() {
            if (this.contactEmail === this.questionnaireData?.contact?.email) {
                document.getElementById('closeEmailModalBtn').click();
                document.getElementById('openPasswordModal').click();
            } else {
                this.emailError = "This email address isn't valid with third party contact email.";
            }
        },

        checkPassword() {
            if (this.accessPassword === this.questionnaireData?.latest_contact_questionnaire_answer?.access_password) {
                document.getElementById('closePasswordModalBtn').click();
                this.showQuestionnaire = true;
                console.log("hhhhh")
            } else {
                this.passwordError = 'Incorrect password.';
            }
        },

        handleScroll() {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                this.showBackToTop = true;
            } else {
                this.showBackToTop = false;
            }
        },

        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },

        showAlert(type, message) {
            Swal.fire({
                icon: type,
                title: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        },

        showSuccessAlert(message) {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: message,
                showConfirmButton: false,
                timer: 3000
            });
        },

        showLoading() {
            $.blockUI({
                message: '<div class="d-flex justify-content-center align-items-center"><p class="me-50 mb-0">Please wait while we process your answers</p> <div class="spinner-grow spinner-grow-sm text-white" role="status"></div></div>',
                css: {
                    backgroundColor: 'transparent',
                    color: '#fff',
                    border: '0'
                },
                overlayCSS: {
                    opacity: 0.5
                }
            });
        },

        hideLoading() {
            $.unblockUI();
        },

        // Khaled

        async fetchQuestionnaireData() {
            try {
                const response = await this.api.getQuestionnaireData(this.$route.params.id);
                this.questionnaireData = response;
            } catch (error) {
                console.error('Error fetching questionnaire data:', error);
            }
        },

        // fetchQuestionnaireData() {
        //     axios.get(`/view-third-party-questionnaire-answer/${this.$route.params.id}`).then(response => {
        //         this.questionnaireData = response.data.data
        //         console.log('response');
        //         console.log(this.questionnaireData);
        //     })
        // },

        async submitQuestionnaire(submissionType) {
            // Prepare data for submission
            const data = {
                questionnaire_id: this.questionnaireData.id,
                contact_id: this.questionnaireData.contact.id,
                submission_type: submissionType,
                answers: []
            };

            // Loop through questions to collect answers
            const questions = this.displayedQuestions;
            console.log('questions is ')
            console.log(questions)

            questions.forEach(question => {
                const questionId = question.id;
                const answerData = {
                    question_id: questionId,
                    answer_id: this.userAnswers[questionId] || null,
                    comment: this.userComments[questionId] || ''
                };

                // Include risk data if available
                // const answer = question.answers.find(a => a.id === this.userAnswers[questionId]);
                // if (answer && answer.risk) {
                //     answerData.risk = answer.risk;
                // }

                question.answers.forEach(answer => {
                    if (answer.risk) {
                        answerData.risk = answer.risk;
                    }
                });

                data.answers.push(answerData);
            });

            // Check if all questions are answered for 'complete' submission
            if (submissionType === 'complete' && this.questionnaireData.all_questions_mandatory == 'true') {
                const unansweredQuestions = data.answers.filter(answer => answer.answer_id === null);
                if (unansweredQuestions.length > 0) {
                    this.api.poup({ message: "Please answer all questions !" }, "Answering Questions");
                    return;
                }
            }

            if (submissionType === 'draft') {
                this.isDraftDisabled = true;
            }

            try {
                // Show loading indicator
                // this.showLoading();
                const response = await axios.post(`/save-third-party-questionnaire-answer/${this.$route.params.id}`, data);
                let message = submissionType == 'complete' ? 'Answering Questions Completed Successfully' : 'Answering Questions Drafted Successfully'
                if (response.data.status == "success") {
                    this.api.poup(response, message);
                }
            } catch (error) {
                console.error('Error saving answers:', error);
            }
        },

        checkForChanges() {
            const changedAnswers = JSON.stringify(this.userAnswers) !== JSON.stringify(this.originalAnswers);
            const changedComments = JSON.stringify(this.userComments) !== JSON.stringify(this.originalComments);

            if (changedAnswers || changedComments) {
                this.isDraftDisabled = false;
            }
        }


    }
};
</script>

<style scoped>
body {
    background-color: #f4f6f9;
    color: #333;
    font-family: "Cairo", "cairoregular", "Cambria", 'Cochin', 'Georgia', 'Times', 'Times New Roman', 'sans-serif';
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin-top: 50px;
}

/* Styles for the "Back to Top" button */
#backToTopBtn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 15px;
    font-size: 14px;
    cursor: pointer;
    opacity: 0;
    transform: translateY(20px);
    z-index: 1000;
}

/* Animation keyframes */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeOutDown {
    from {
        opacity: 1;
        transform: translateY(0);
    }
}
.modal-header {
    justify-content: space-between;
}
[dir="rtl"] .modal-header ,[dir="rtl"] .dropdown-item {
    flex-direction: row-reverse;
}
[dir="rtl"] .modal-body .row{
text-align: end;
}
</style>