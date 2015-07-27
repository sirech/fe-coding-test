class RegistrationController < ApplicationController
  def index
  end

  def create
    @registration = Registrations.new(registration_params)

    @registration.save
  end

  def validate
    reg = Registration.new(registration_params)
    reg.valid?
    errors = reg.errors[params[:registrations].keys.first]

    render json: { valid: errors.none?, errors: errors }
  end

  private

  def registration_params
    params.require(:registrations).permit(:name, :lastname, :email, :age, :gender, :password)
  end
end
