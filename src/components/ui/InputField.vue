<script setup>
import { computed, watch, ref } from 'vue';
import { Search, Mail, Lock, User, Hash, Phone, Eye, EyeOff } from 'lucide-vue-next';

const props = defineProps({
    inputField: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['update:modelValue', 'valueChange', 'validInput']);

const validationStates = ref({});
const otpValues = ref(["", "", "", ""]); // Store OTP digits

const validateInput = (type, value) => {
    switch (type) {
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'phone':
            return /^\d{10}$/.test(value.replace(/\D/g, ''));
        case 'number':
            return !isNaN(value) && value !== '';
        case 'password':
            return value && value.length >= 6;
        case 'otp':
            return /^\d{4}$/.test(value);
        case 'search':
            return true;
        default:
            return true;
    }
};

const showPassword = ref(false);

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

const iconMap = { search: Search, mail: Mail, lock: Lock, user: User, hash: Hash, phone: Phone };

const handleInput = (handler, event, type) => {
    let value = event.target.value;
    if (type === 'otp') {
        value = value.replace(/\D/g, '').slice(0, 4);
    }
    const isValid = validateInput(type, value);
    validationStates.value[type] = isValid;

    if (handler) {
        handler(event);
    } else {
        emit('update:modelValue', value);
    }

    emit('valueChange', { type, value });
    emit('validInput', { type, value: isValid });
};

const getSelectedIcon = (iconName) => iconName ? iconMap[iconName.toLowerCase()] : null;

const getInputClasses = (type) => [
    'w-full', 'pl-10', 'pr-4', 'py-2', 'border', 'border-outline', 'dark:border-dark-outline',
    'rounded-md', 'focus:outline-none', 'focus:ring-1',
    validationStates.value[type] === false ? 'focus:border-error' : 'focus:border-transparent',
    validationStates.value[type] === false ? 'focus:ring-error' : 'focus:ring-outline',
    'placeholder-info', 'dark:placeholder-dark-info', 'text-foreground', 'dark:text-dark-foreground'
];
const getInputClassesOtp = (type) => [
    'w-full', 'pl-5', 'pr-4', 'py-2', 'border', 'border-outline', 'dark:border-dark-outline',
    'rounded-md', 'focus:outline-none', 'focus:ring-1',
    validationStates.value[type] === false ? 'focus:border-error' : 'focus:border-transparent',
    validationStates.value[type] === false ? 'focus:ring-error' : 'focus:ring-outline',
    'placeholder-info', 'dark:placeholder-dark-info', 'text-foreground', 'dark:text-dark-foreground'
];


// Watch for changes in input values
props.inputField.forEach(input => {
    watch(
        () => input.value,
        (newValue) => {
            let type = Object.keys(input).find(key => ['search', 'email', 'password', 'number', 'phone', 'text', 'otp'].includes(key));
            const isValid = validateInput(type, newValue);
            validationStates.value[type] = isValid;
            emit('valueChange', { type, value: newValue });
            emit('validInput', { type, value: isValid });
        }
    );
});

// Handle OTP input change
const handleOtpInput = (index, event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 1);
    otpValues.value[index] = value;

    if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
    }

    validateOtp();
};

// Handle backspace in OTP fields
const handleOtpBackspace = (index, event) => {
    if (event.key === "Backspace" && !otpValues.value[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
    }
};

// Validate and emit OTP value
const validateOtp = () => {
    const otp = otpValues.value.join("");
    const isValid = /^\d{4}$/.test(otp);
    validationStates.value["otp"] = isValid;
    emit("update:modelValue", otp);
    emit("validInput", { type: "otp", value: isValid });
};
</script>

<template>
    <div class="flex flex-wrap gap-2">
        <template v-for="(input, index) in inputField" :key="index">
            <!-- Search Input -->
            <div v-if="input.search" class="relative w-full">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <component :is="getSelectedIcon(input.icon)" v-if="input.icon" class="w-5 h-5" />
                </div>
                <input type="search" :value="input.value" @input="handleInput(input.onInput, $event, 'search')"
                    :placeholder="input.search" :class="getInputClasses('search')" />
            </div>

            <!-- Text Input -->
            <div v-if="input.text" class="relative w-full">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <component :is="getSelectedIcon(input.icon)" v-if="input.icon" class="w-5 h-5" />
                </div>
                <input type="text" :value="input.value" @input="handleInput(input.onInput, $event, 'text')"
                    :placeholder="input.text" :class="getInputClasses(text)" />
            </div>

            <!-- Email Input -->
            <div v-if="input.email" class="relative w-full">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <component :is="getSelectedIcon(input.icon)" v-if="input.icon" class="w-5 h-5" />
                </div>
                <input type="email" :value="input.value" @input="handleInput(input.onInput, $event, 'email')"
                    :placeholder="input.email" :class="getInputClasses('email')" />
            </div>

            <!-- Password Input -->
            <div v-if="input.password" class="relative w-full">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <component :is="getSelectedIcon(input.icon)" v-if="input.icon" class="w-5 h-5" />
                </div>

                <!-- Password Input Field -->
                <input :type="showPassword ? 'text' : 'password'" :value="input.value"
                    @input="handleInput(input.onInput, $event, 'password')" :placeholder="input.password"
                    :class="getInputClasses('password')" />

                <!-- Eye Toggle Icon on the right -->
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                    @click="togglePasswordVisibility">
                    <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
                </div>
            </div>
            <!-- Number Input -->
            <div v-if="input.number" class="relative w-full">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <component :is="getSelectedIcon(input.icon)" v-if="input.icon" class="w-5 h-5" />
                </div>
                <input type="number" :value="input.value" @input="handleInput(input.onInput, $event, 'number')"
                    :placeholder="input.number" :class="getInputClasses('number')" />
            </div>

            <!-- Phone Input -->
            <div v-if="input.phone" class="relative w-full">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <component :is="getSelectedIcon(input.icon)" v-if="input.icon" class="w-5 h-5" />
                </div>
                <input type="tel" :value="input.value" @input="handleInput(input.onInput, $event, 'phone')"
                    :placeholder="input.phone" :class="getInputClasses('phone')" />
            </div>

            <!-- OTP Input -->
            <div v-if="input.otp">
                <!-- OTP Input Fields -->
                <div class="flex gap-2">
                    <div v-for="(digit, index) in otpValues" :key="index" class="relative">
                        <input :id="`otp-${index}`" type="text"
                            class="w-12 h-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            maxlength="1" v-model="otpValues[index]" @input="handleOtpInput(index, $event)"
                            @keydown="handleOtpBackspace(index, $event)" :class="getInputClassesOtp('otp')" />
                    </div>
                </div>
            </div>


        </template>
    </div>
</template>